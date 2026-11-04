'use dom';

import './leaflet.css';

import L from 'leaflet';
import { useEffect, useRef } from 'react';

type LatLng = [number, number];
export type MapField = { id: string; name: string; boundary: LatLng[] };
/** Moves the map: to fit `points`, or to one point at `zoom`. A new `key` moves it again. */
export type MapFocus = { key: number; points: LatLng[]; zoom?: number };

type Props = {
  fields: MapField[];
  selectedId?: string | null;
  /** Corners being drawn (draw mode), in order. */
  draft?: LatLng[] | null;
  /** While drawing, a tap on the map adds a corner (onTap) instead of selecting a field. */
  drawing?: boolean;
  focus?: MapFocus | null;
  /** The phone's position, when the farmer asked for it. */
  me?: LatLng | null;
  onSelect?: (id: string) => Promise<void>;
  onTap?: (lat: number, lng: number) => Promise<void>;
  /** Space the screen's own bars cover at the top and bottom, in px: controls and fitted views stay clear of them. */
  inset?: { top: number; bottom: number };
  dom?: import('expo/dom').DOMProps;
  /** Native side only: the web view, so the screen can restart it (see use-dom-height). */
  ref?: import('react').Ref<import('./use-dom-height').DomViewRef>;
};

const GREEN = '#10b981';
const GOLD = '#fbbf24';
const TURKIYE: LatLng = [39.0, 35.2];

const STYLE = `
.leaflet-container { background: #1f2937; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
.field-label { background: rgba(15, 23, 42, 0.78); color: #fff; border: 0; border-radius: 999px; padding: 3px 9px; font-weight: 700; font-size: 12px; box-shadow: none; white-space: nowrap; }
.field-label::before { display: none; }
.field-label.on { background: #fff; color: #0f172a; }
.leaflet-top, .leaflet-bottom { transition: top 0.2s, bottom 0.2s; }
.leaflet-top.leaflet-left { display: none; }
.leaflet-control-attribution { font-size: 10px; background: rgba(255,255,255,0.75) !important; }
.leaflet-control-zoom a { width: 44px !important; height: 44px !important; line-height: 44px !important; font-size: 22px !important; }
`;

/**
 * "Tarla Haritası" on a satellite map (Esri World Imagery, with place names), drawn with Leaflet in a
 * web view: the farmer's fields as outlines with their names; in draw mode, the corners tapped so far.
 */
export default function FieldMapDom({ fields, selectedId, draft, drawing, focus, me, onSelect, onTap, inset }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<L.LayerGroup | null>(null);
  const drawLayer = useRef<L.LayerGroup | null>(null);
  const meLayer = useRef<L.LayerGroup | null>(null);
  // The latest props for Leaflet's handlers, which are bound once.
  const live = useRef({ drawing, onSelect, onTap });
  useEffect(() => {
    live.current = { drawing, onSelect, onTap };
  });

  useEffect(() => {
    if (!el.current || map.current) return;
    const style = document.createElement('style');
    style.textContent = STYLE;
    document.head.appendChild(style);
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';

    const m = L.map(el.current, { center: TURKIYE, zoom: 6, zoomControl: false, attributionControl: true, tapTolerance: 20, maxZoom: 19 });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      maxNativeZoom: 18,
      attribution: 'Uydu görüntüsü: Esri, Maxar, Earthstar Geographics',
    }).addTo(m);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, maxNativeZoom: 18 }).addTo(m);
    m.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    // Zoom buttons on the right, where the back button isn't.
    L.control.zoom({ position: 'topright', zoomInTitle: 'Yakınlaştır', zoomOutTitle: 'Uzaklaştır' }).addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => {
      if (live.current.drawing) void live.current.onTap?.(e.latlng.lat, e.latlng.lng);
    });
    layers.current = L.layerGroup().addTo(m);
    drawLayer.current = L.layerGroup().addTo(m);
    meLayer.current = L.layerGroup().addTo(m);
    map.current = m;
    const resize = () => m.invalidateSize();
    window.addEventListener('resize', resize);
    const t = setTimeout(resize, 200);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', resize);
      m.remove();
      map.current = null;
    };
  }, []);

  // The fields' outlines and names.
  useEffect(() => {
    const group = layers.current;
    if (!group) return;
    group.clearLayers();
    for (const f of fields) {
      if (f.boundary.length < 3) continue;
      const on = f.id === selectedId;
      const poly = L.polygon(f.boundary, {
        color: on ? '#ffffff' : GREEN,
        weight: on ? 4 : 2.5,
        fillColor: GREEN,
        fillOpacity: on ? 0.35 : 0.22,
        interactive: !drawing,
        bubblingMouseEvents: false,
      });
      poly.bindTooltip(f.name, { permanent: true, direction: 'center', className: on ? 'field-label on' : 'field-label', interactive: false });
      poly.on('click', () => {
        if (!live.current.drawing) void live.current.onSelect?.(f.id);
      });
      poly.addTo(group);
    }
  }, [fields, selectedId, drawing]);

  // The outline being drawn: its corners, numbered by order, and the shape so far.
  useEffect(() => {
    const group = drawLayer.current;
    if (!group) return;
    group.clearLayers();
    if (!draft?.length) return;
    if (draft.length >= 3) L.polygon(draft, { color: GOLD, weight: 3, fillColor: GOLD, fillOpacity: 0.25, interactive: false }).addTo(group);
    else if (draft.length === 2) L.polyline(draft, { color: GOLD, weight: 3, interactive: false }).addTo(group);
    draft.forEach((p, i) => {
      L.circleMarker(p, { radius: i === draft.length - 1 ? 9 : 7, color: '#ffffff', weight: 3, fillColor: GOLD, fillOpacity: 1, interactive: false }).addTo(group);
    });
  }, [draft]);

  useEffect(() => {
    const group = meLayer.current;
    if (!group) return;
    group.clearLayers();
    if (me) L.circleMarker(me, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1, interactive: false }).addTo(group);
  }, [me]);

  // The zoom buttons and the credits sit inside the part of the map that isn't covered.
  const top = inset?.top ?? 0;
  const bottom = inset?.bottom ?? 0;
  useEffect(() => {
    let style = document.getElementById('map-inset') as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = 'map-inset';
      document.head.appendChild(style);
    }
    style.textContent = `.leaflet-top { top: ${top}px; } .leaflet-bottom { bottom: ${bottom}px; }`;
  }, [top, bottom]);

  // Where to look: a new focus key moves the map, framed in the uncovered part.
  const focusKey = focus?.key;
  useEffect(() => {
    const m = map.current;
    if (!m || !focus || !focus.points.length) return;
    if (focus.points.length === 1) {
      m.setView(focus.points[0], focus.zoom ?? 16, { animate: false });
      m.panBy([0, (bottom - top) / 2], { animate: false });
    } else m.fitBounds(L.latLngBounds(focus.points), { paddingTopLeft: [28, top + 20], paddingBottomRight: [28, bottom + 20], maxZoom: 18 });
    // Only a new key moves the map, not a re-render with the same focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  // zIndex 0 keeps Leaflet's layers (z-index 400+) inside the map, under the screen's own bars on the web.
  return <div ref={el} style={{ position: 'absolute', inset: 0, zIndex: 0 }} aria-label="Uydu haritası" role="application" />;
}
