import { RoutingConfig } from './config';
import { haversineKm, travelMinutes } from './geo';
import { GeoPoint } from './types';

// Abstraction over the distance/time source. The Haversine provider is the
// zero-dependency fallback; an OSRM-backed provider can implement the same
// interface to plug in real road network distances (PRD section 16.5).
export interface DistanceProvider {
  distanceKm(a: GeoPoint, b: GeoPoint): number;
  durationMinutes(a: GeoPoint, b: GeoPoint): number;
}

export class HaversineDistanceProvider implements DistanceProvider {
  constructor(private readonly cfg: RoutingConfig) {}

  distanceKm(a: GeoPoint, b: GeoPoint): number {
    return haversineKm(a, b);
  }

  durationMinutes(a: GeoPoint, b: GeoPoint): number {
    return travelMinutes(this.distanceKm(a, b), this.cfg.fallback_speed_kmh);
  }
}
