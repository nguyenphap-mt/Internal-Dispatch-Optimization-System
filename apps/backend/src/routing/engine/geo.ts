import { GeoPoint } from './types';

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Great-circle distance in km. Used as the OSRM-free fallback distance metric.
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function hasCoords(p?: Partial<GeoPoint>): p is GeoPoint {
  return (
    !!p &&
    typeof p.lat === 'number' &&
    typeof p.lng === 'number' &&
    !Number.isNaN(p.lat) &&
    !Number.isNaN(p.lng)
  );
}

// Travel time in minutes from distance at a configured average speed.
export function travelMinutes(distanceKm: number, speedKmh: number): number {
  if (speedKmh <= 0) return 0;
  return (distanceKm / speedKmh) * 60;
}
