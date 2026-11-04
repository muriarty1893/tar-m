/**
 * Field outlines drawn on the mobile app's map ("Tarla Haritası"): corners as [latitude, longitude].
 * The app keeps a copy of these rules (mobile/src/domain/geo.ts); keep the two in step.
 */
export type LatLng = [lat: number, lng: number];

export const BOUNDARY_MIN_POINTS = 3;
export const BOUNDARY_MAX_POINTS = 60;

const EARTH_RADIUS_M = 6_378_137;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** The outline as saved, or null if it isn't a usable polygon. Coordinates are rounded to ~1 cm. */
export function parseBoundary(value: unknown): LatLng[] | null {
  if (!Array.isArray(value) || value.length < BOUNDARY_MIN_POINTS || value.length > BOUNDARY_MAX_POINTS) return null;
  const points: LatLng[] = [];
  for (const p of value) {
    if (!Array.isArray(p) || p.length !== 2) return null;
    const [lat, lng] = p;
    if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (Math.abs(lat) > 85 || Math.abs(lng) > 180) return null;
    points.push([Math.round(lat * 1e7) / 1e7, Math.round(lng * 1e7) / 1e7]);
  }
  return areaM2(points) > 0 ? points : null;
}

/** The polygon's area on the sphere, in square metres (Chamberlain & Duquette). */
export function areaM2(points: LatLng[]): number {
  if (points.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [lat1, lng1] = points[i];
    const [lat2, lng2] = points[(i + 1) % points.length];
    sum += rad(lng2 - lng1) * (2 + Math.sin(rad(lat1)) + Math.sin(rad(lat2)));
  }
  return Math.abs((sum * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

/** 1 dönüm = 1.000 m². Rounded to a tenth. */
export const donumOf = (m2: number) => Math.round(m2 / 100) / 10;
