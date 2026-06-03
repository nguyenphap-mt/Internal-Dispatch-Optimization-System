import { Classification } from '../../common/enums';
import { clusterByAreaAndTime } from './clustering';
import { DEFAULT_ROUTING_CONFIG, RoutingConfig } from './config';
import { DistanceProvider, HaversineDistanceProvider } from './distance';
import { planCluster } from './optimizer';
import { scoreRequests } from './scoring';
import { matchVehicles } from './vehicle-match';
import {
  EngineRoute,
  OptimizeInput,
  OptimizeResult,
  ScoredRequest,
} from './types';

// optimizeDispatch — the decision-first routing brain (PRD section 10.9).
export function optimizeDispatch(
  input: OptimizeInput,
  config: Partial<RoutingConfig> = {},
  distanceProvider?: DistanceProvider,
): OptimizeResult {
  const cfg: RoutingConfig = { ...DEFAULT_ROUTING_CONFIG, ...config };
  const dp = distanceProvider ?? new HaversineDistanceProvider(cfg);
  const { requests, vehicles, depot, currentTime } = input;

  const scored = scoreRequests(requests, currentTime, cfg);

  const invalid = scored.filter(
    (r) => r.classification === Classification.INVALID,
  );
  const valid = scored.filter((r) => r.classification !== Classification.INVALID);

  const urgent = valid.filter((r) => r.classification === Classification.URGENT);
  const nextTrip = valid.filter(
    (r) => r.classification === Classification.NEXT_TRIP,
  );
  const groupable = valid.filter(
    (r) => r.classification === Classification.GROUPABLE,
  );
  const waiting = valid.filter(
    (r) => r.classification === Classification.WAITING,
  );

  // candidateRequests = urgent + nextTrip; if nothing urgent, pull in groupable
  // requests so a worthwhile combined trip can still be formed (section 10.9).
  let candidates: ScoredRequest[] = [...urgent, ...nextTrip];
  if (urgent.length === 0) {
    candidates = candidates.concat(groupable);
  }

  const vehicleMatches = matchVehicles(candidates, cfg);
  const clusters = clusterByAreaAndTime(candidates, cfg);

  const activeVehicles = vehicles;
  const routes: EngineRoute[] = [];
  for (const cluster of clusters) {
    routes.push(
      ...planCluster(cluster, activeVehicles, depot, dp, cfg, currentTime),
    );
  }

  const totalCost = round(routes.reduce((s, r) => s + r.total_cost, 0));
  const totalDistanceKm = round(
    routes.reduce((s, r) => s + r.total_distance_km, 0),
  );
  const totalDurationMinutes = round(
    routes.reduce((s, r) => s + r.total_duration_minutes, 0),
  );

  const warnings: string[] = [];
  if (invalid.length > 0) {
    warnings.push(`${invalid.length} đơn lỗi dữ liệu/tọa độ cần kiểm tra.`);
  }
  for (const route of routes) warnings.push(...route.warnings);

  const explanation = buildExplanation(
    { urgent, nextTrip, groupable, waiting, invalid },
    routes,
  );

  return {
    urgentRequests: urgent,
    nextTripRequests: nextTrip,
    groupableRequests: groupable,
    waitingRequests: waiting,
    invalidRequests: invalid,
    vehicleMatches,
    suggestedRoutes: routes,
    totalCost,
    totalDistanceKm,
    totalDurationMinutes,
    warnings,
    explanation,
  };
}

function buildExplanation(
  groups: {
    urgent: ScoredRequest[];
    nextTrip: ScoredRequest[];
    groupable: ScoredRequest[];
    waiting: ScoredRequest[];
    invalid: ScoredRequest[];
  },
  routes: EngineRoute[],
): string {
  return [
    `Phân loại: ${groups.urgent.length} đi ngay, ${groups.nextTrip.length} chuyến gần nhất, ${groups.groupable.length} có thể gom, ${groups.waiting.length} chờ, ${groups.invalid.length} lỗi dữ liệu.`,
    `Đề xuất ${routes.length} tuyến.`,
    'Ưu tiên tối ưu: không trễ hẹn > không vượt tải > chi phí thấp nhất > km thấp nhất > thời gian thấp nhất (PRD 10.7).',
  ].join(' ');
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
