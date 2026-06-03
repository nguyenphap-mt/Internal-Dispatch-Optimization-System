import { RoutingConfig } from './config';
import { effectiveDeadline } from './scoring';
import { EngineRequest } from './types';

export interface Cluster {
  key: string;
  area: string;
  requests: EngineRequest[];
}

// Group candidate requests by area and time-window compatibility (PRD section 9.4).
// BR-GRP-001/003: only group requests in the same area with compatible windows.
// BR-GRP-008: if the wait to fill a group exceeds the max, the request is still
// kept (the optimizer will route it on the nearest trip rather than waiting).
export function clusterByAreaAndTime(
  requests: EngineRequest[],
  cfg: RoutingConfig,
): Cluster[] {
  const byArea = new Map<string, EngineRequest[]>();
  for (const r of requests) {
    const area = r.area && r.area.length > 0 ? r.area : 'UNKNOWN';
    if (!byArea.has(area)) byArea.set(area, []);
    byArea.get(area)!.push(r);
  }

  const clusters: Cluster[] = [];
  const maxWaitMs = cfg.max_waiting_time_for_grouping_minutes * 60_000;

  for (const [area, reqs] of byArea.entries()) {
    // Sort by deadline so time-compatible requests sit next to each other.
    const sorted = [...reqs].sort(
      (a, b) =>
        (effectiveDeadline(a) ?? Number.MAX_SAFE_INTEGER) -
        (effectiveDeadline(b) ?? Number.MAX_SAFE_INTEGER),
    );

    let bucket: EngineRequest[] = [];
    let bucketAnchor: number | null = null;
    let index = 0;

    const flush = () => {
      if (bucket.length > 0) {
        clusters.push({ key: `${area}#${index++}`, area, requests: bucket });
        bucket = [];
        bucketAnchor = null;
      }
    };

    for (const r of sorted) {
      const dl = effectiveDeadline(r);
      if (bucketAnchor == null || dl == null) {
        bucket.push(r);
        if (dl != null && bucketAnchor == null) bucketAnchor = dl;
        continue;
      }
      // BR-GRP-001: keep windows compatible within the max waiting horizon.
      if (dl - bucketAnchor <= maxWaitMs) {
        bucket.push(r);
      } else {
        flush();
        bucket.push(r);
        bucketAnchor = dl;
      }
    }
    flush();
  }

  return clusters;
}
