import { Injectable, Logger } from '@nestjs/common';
import { RoutingConfig } from './engine/config';
import { DistanceProvider, HaversineDistanceProvider } from './engine/distance';
import { haversineKm, travelMinutes } from './engine/geo';
import { GeoPoint } from './engine/types';

function key(p: GeoPoint): string {
  return `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`;
}

// A distance provider backed by a precomputed matrix (e.g. from OSRM /table),
// with a Haversine fallback for any coordinate pair not present in the matrix.
export class MatrixDistanceProvider implements DistanceProvider {
  constructor(
    private readonly distKm: Map<string, number>,
    private readonly durMin: Map<string, number>,
    private readonly cfg: RoutingConfig,
  ) {}

  private pair(a: GeoPoint, b: GeoPoint): string {
    return `${key(a)}|${key(b)}`;
  }

  distanceKm(a: GeoPoint, b: GeoPoint): number {
    const v = this.distKm.get(this.pair(a, b));
    return v != null ? v : haversineKm(a, b);
  }

  durationMinutes(a: GeoPoint, b: GeoPoint): number {
    const v = this.durMin.get(this.pair(a, b));
    return v != null ? v : travelMinutes(haversineKm(a, b), this.cfg.fallback_speed_kmh);
  }
}

@Injectable()
export class OsrmService {
  private readonly logger = new Logger(OsrmService.name);

  get enabled(): boolean {
    return !!process.env.OSRM_URL;
  }

  // Build a DistanceProvider for the given points. Uses OSRM /table when
  // OSRM_URL is configured and reachable, otherwise the Haversine fallback
  // (PRD section 16.5: OSRM self-host, with a zero-dependency fallback).
  async buildProvider(
    points: GeoPoint[],
    cfg: RoutingConfig,
  ): Promise<DistanceProvider> {
    if (!this.enabled || points.length === 0) {
      return new HaversineDistanceProvider(cfg);
    }
    try {
      const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
      const url = `${process.env.OSRM_URL}/table/v1/driving/${coords}?annotations=distance,duration`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OSRM ${res.status}`);
      const data = (await res.json()) as {
        distances?: number[][];
        durations?: number[][];
      };
      const distKm = new Map<string, number>();
      const durMin = new Map<string, number>();
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points.length; j++) {
          const pairKey = `${key(points[i])}|${key(points[j])}`;
          if (data.distances?.[i]?.[j] != null) {
            distKm.set(pairKey, data.distances[i][j] / 1000);
          }
          if (data.durations?.[i]?.[j] != null) {
            durMin.set(pairKey, data.durations[i][j] / 60);
          }
        }
      }
      return new MatrixDistanceProvider(distKm, durMin, cfg);
    } catch (err) {
      this.logger.warn(
        `OSRM không khả dụng, dùng Haversine fallback: ${(err as Error).message}`,
      );
      return new HaversineDistanceProvider(cfg);
    }
  }
}
