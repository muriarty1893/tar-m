/**
 * Field outlines on "Tarla Haritası": corners as [latitude, longitude]. The checks and the area are the
 * website's (lib/geo.ts), which also checks them when they're saved; keep the two in step.
 */
import type { LatLng } from '@/api/types';

export type { LatLng };

export const BOUNDARY_MIN_POINTS = 3;
export const BOUNDARY_MAX_POINTS = 60;

const EARTH_RADIUS_M = 6_378_137;
const rad = (deg: number) => (deg * Math.PI) / 180;

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

/** The middle of the outline's box (for a label or to centre the map). */
export function centerOf(points: LatLng[]): LatLng {
  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  return [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
}

/** Whether these corners make a field that can be saved. */
export const isDrawable = (points: LatLng[]) => points.length >= BOUNDARY_MIN_POINTS && points.length <= BOUNDARY_MAX_POINTS && areaM2(points) > 1;
