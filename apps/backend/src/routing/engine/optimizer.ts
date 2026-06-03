import { Cluster } from './clustering';
import { RoutingConfig } from './config';
import { DistanceProvider } from './distance';
import { hasCoords } from './geo';
import { vehicleCanServeRequest } from './vehicle-match';
import {
  EngineRequest,
  EngineRoute,
  EngineStop,
  EngineVehicle,
  GeoPoint,
  PlannedStop,
} from './types';

const MS_PER_MIN = 60_000;

interface WorkStop extends EngineStop {
  // index of the request inside the cluster, for precedence checks
  reqIndex: number;
}

// Gather pickup/delivery stops for the cluster, tagged with the owning request.
function collectStops(requests: EngineRequest[]): WorkStop[] {
  const stops: WorkStop[] = [];
  requests.forEach((r, reqIndex) => {
    for (const s of r.stops) {
      stops.push({ ...s, reqIndex });
    }
  });
  return stops;
}

// Precedence: a delivery stop must come after its request's pickup stop.
function respectsPrecedence(order: WorkStop[]): boolean {
  const pickupSeen = new Map<number, boolean>();
  for (const stop of order) {
    if (stop.point_type === 'Pickup') {
      pickupSeen.set(stop.reqIndex, true);
    } else {
      // delivery: only invalid if that request also has a pickup that hasn't run
      const hasPickup = order.some(
        (o) => o.reqIndex === stop.reqIndex && o.point_type === 'Pickup',
      );
      if (hasPickup && !pickupSeen.get(stop.reqIndex)) return false;
    }
  }
  return true;
}

function nearestNeighbourOrder(
  depot: GeoPoint,
  stops: WorkStop[],
  dp: DistanceProvider,
): WorkStop[] {
  const remaining = [...stops];
  const order: WorkStop[] = [];
  let current: GeoPoint = depot;
  const pickedReq = new Set<number>();

  while (remaining.length > 0) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const s = remaining[i];
      // enforce precedence: skip a delivery whose pickup is still pending
      if (s.point_type === 'Delivery') {
        const hasPickup = stops.some(
          (o) => o.reqIndex === s.reqIndex && o.point_type === 'Pickup',
        );
        if (hasPickup && !pickedReq.has(s.reqIndex)) continue;
      }
      if (!hasCoords(s)) continue;
      const d = dp.distanceKm(current, s as GeoPoint);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx === -1) {
      // only precedence-blocked stops remain; take the first by force
      bestIdx = 0;
    }
    const chosen = remaining.splice(bestIdx, 1)[0];
    if (chosen.point_type === 'Pickup') pickedReq.add(chosen.reqIndex);
    order.push(chosen);
    if (hasCoords(chosen)) current = chosen as GeoPoint;
  }
  return order;
}

function routeRawDistance(
  depot: GeoPoint,
  order: WorkStop[],
  dp: DistanceProvider,
): number {
  if (order.length === 0) return 0;
  let total = 0;
  let prev: GeoPoint = depot;
  for (const s of order) {
    if (hasCoords(s)) {
      total += dp.distanceKm(prev, s as GeoPoint);
      prev = s as GeoPoint;
    }
  }
  total += dp.distanceKm(prev, depot); // return to depot
  return total;
}

// 2-opt local search that preserves pickup-before-delivery precedence.
function twoOpt(
  depot: GeoPoint,
  order: WorkStop[],
  dp: DistanceProvider,
): WorkStop[] {
  let best = order;
  let bestDist = routeRawDistance(depot, best, dp);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = best
          .slice(0, i)
          .concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        if (!respectsPrecedence(candidate)) continue;
        const dist = routeRawDistance(depot, candidate, dp);
        if (dist < bestDist - 1e-9) {
          best = candidate;
          bestDist = dist;
          improved = true;
        }
      }
    }
  }
  return best;
}

interface Timeline {
  planned: PlannedStop[];
  departure_time: number;
  total_distance_km: number;
  total_duration_minutes: number;
  late_minutes: number;
  empty_distance_km: number;
}

// Simulate the timeline for an ordered set of stops. Picks a departure time that
// minimises idle waiting before the first time-windowed stop while never
// arriving late when avoidable (PRD section 10.1 #5 optimal departure).
function buildTimeline(
  depot: GeoPoint,
  order: WorkStop[],
  dp: DistanceProvider,
  cfg: RoutingConfig,
  currentTime: number,
): Timeline {
  // First pass from currentTime to discover slack before the first window.
  const simulate = (departure: number) => {
    let clock = departure;
    let prev: GeoPoint = depot;
    let distance = 0;
    let late = 0;
    const planned: PlannedStop[] = [];
    let firstSlack: number | null = null;

    order.forEach((s, idx) => {
      const leg = hasCoords(s) ? dp.distanceKm(prev, s as GeoPoint) : 0;
      const legMin = hasCoords(s) ? dp.durationMinutes(prev, s as GeoPoint) : 0;
      distance += leg;
      let arrival = clock + legMin * MS_PER_MIN;
      if (s.window_start != null && arrival < s.window_start) {
        const slack = s.window_start - arrival;
        if (firstSlack == null) firstSlack = slack;
        arrival = s.window_start; // wait until window opens
      }
      const lateMs =
        s.window_end != null && arrival > s.window_end
          ? arrival - s.window_end
          : 0;
      late += lateMs;
      const departTime =
        arrival + (s.service_time_minutes ?? cfg.service_time_per_stop_minutes) * MS_PER_MIN;
      planned.push({
        ...s,
        stop_sequence: idx + 1,
        planned_arrival_time: arrival,
        planned_departure_time: departTime,
        late_minutes: lateMs / MS_PER_MIN,
      });
      clock = departTime;
      if (hasCoords(s)) prev = s as GeoPoint;
    });

    const returnLeg = dp.distanceKm(prev, depot);
    distance += returnLeg;
    const durationMin = (clock - departure) / MS_PER_MIN;
    return { planned, distance, late, durationMin, firstSlack };
  };

  const first = simulate(currentTime);
  // Shift departure forward by the slack before the first window, but only if it
  // does not introduce lateness (it cannot, since downstream legs are unchanged).
  let departure = currentTime;
  if (first.firstSlack && first.firstSlack > 0 && first.late === 0) {
    departure = currentTime + first.firstSlack;
  }
  const sim = simulate(departure);

  // Empty distance: depot -> first stop and last stop -> depot (running without
  // a productive pickup/delivery between).
  let empty = 0;
  if (order.length > 0) {
    const firstStop = order.find(hasCoords) as GeoPoint | undefined;
    const lastStop = [...order].reverse().find(hasCoords) as GeoPoint | undefined;
    if (firstStop) empty += dp.distanceKm(depot, firstStop);
    if (lastStop) empty += dp.distanceKm(lastStop, depot);
  }

  return {
    planned: sim.planned,
    departure_time: departure,
    total_distance_km: round(sim.distance),
    total_duration_minutes: round(sim.durationMin),
    late_minutes: round(sim.late / MS_PER_MIN),
    empty_distance_km: round(empty),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

// Cost function per PRD section 10.6.
export function calculateCost(
  timeline: Pick<
    Timeline,
    'total_distance_km' | 'total_duration_minutes' | 'late_minutes' | 'empty_distance_km'
  >,
  vehicle: EngineVehicle,
  cfg: RoutingConfig,
): number {
  const cost =
    timeline.total_distance_km * vehicle.fuel_cost_per_km +
    timeline.total_duration_minutes * cfg.default_driver_cost_per_minute +
    timeline.late_minutes * cfg.late_penalty_per_minute +
    timeline.empty_distance_km * cfg.empty_run_penalty +
    vehicle.fixed_trip_cost;
  return round(cost);
}

// Normalised route score per PRD section 10.8.
function routeScore(
  timeline: Timeline,
  cost: number,
  requestCount: number,
  vehicleFit: boolean,
): number {
  const deadline_score = Math.max(0, 100 - timeline.late_minutes);
  const cost_score = 100 / (1 + cost / (requestCount * 10000 + 1));
  const distance_score =
    100 / (1 + timeline.total_distance_km / (requestCount * 5 + 1));
  const grouping_score =
    requestCount >= 2 ? Math.min(100, 50 + (requestCount - 1) * 15) : 20;
  const vehicle_fit_score = vehicleFit ? 100 : 60;
  return round(
    deadline_score * 0.35 +
      cost_score * 0.3 +
      distance_score * 0.15 +
      grouping_score * 0.1 +
      vehicle_fit_score * 0.1,
  );
}

function explain(
  vehicle: EngineVehicle,
  requests: EngineRequest[],
  timeline: Timeline,
  cost: number,
): string {
  const parts = [
    `Chọn ${vehicle.vehicle_type} ${vehicle.vehicle_code} cho ${requests.length} đơn (${requests
      .map((r) => r.request_code)
      .join(', ')}).`,
    `Tổng quãng đường ~${timeline.total_distance_km} km, thời gian ~${timeline.total_duration_minutes} phút, chi phí ~${cost}.`,
  ];
  if (timeline.late_minutes > 0) {
    parts.push(`Cảnh báo: trễ ~${timeline.late_minutes} phút so với time window.`);
  } else {
    parts.push('Không trễ hẹn (đáp ứng toàn bộ time window).');
  }
  parts.push(
    `Xuất phát đề xuất: ${new Date(timeline.departure_time).toISOString()} để giảm thời gian chờ.`,
  );
  return parts.join(' ');
}

export interface BuiltRoute {
  route: EngineRoute;
  feasibleCapacity: boolean;
}

// Build and optimise one route for a vehicle serving a set of requests.
export function buildRoute(
  vehicle: EngineVehicle,
  requests: EngineRequest[],
  depot: GeoPoint,
  dp: DistanceProvider,
  cfg: RoutingConfig,
  currentTime: number,
): BuiltRoute {
  const warnings: string[] = [];
  const totalWeight = requests.reduce((s, r) => s + r.weight_kg, 0);
  const totalVolume = requests.reduce((s, r) => s + r.volume_m3, 0);

  let feasibleCapacity = true;
  if (totalWeight > vehicle.max_weight_kg) {
    feasibleCapacity = false; // BR-VEH-009
    warnings.push(
      `Vượt tải trọng: ${totalWeight}kg > ${vehicle.max_weight_kg}kg (BR-VEH-009)`,
    );
  }
  if (vehicle.max_volume_m3 > 0 && totalVolume > vehicle.max_volume_m3) {
    feasibleCapacity = false; // BR-VEH-010
    warnings.push(
      `Vượt thể tích: ${totalVolume}m3 > ${vehicle.max_volume_m3}m3 (BR-VEH-010)`,
    );
  }

  const stops = collectStops(requests);
  const nnOrder = nearestNeighbourOrder(depot, stops, dp);
  const optimized = twoOpt(depot, nnOrder, dp);
  const timeline = buildTimeline(depot, optimized, dp, cfg, currentTime);
  const cost = calculateCost(timeline, vehicle, cfg);

  const vehicleFit = requests.every((r) =>
    vehicleCanServeRequest(vehicle, r, cfg),
  );
  if (!vehicleFit) {
    warnings.push('Một số đơn không khớp loại xe theo BR-VEH');
  }

  // BR-GRP-006: a trip with a single non-urgent request is inefficient.
  if (requests.length === 1 && requests[0].priority === 'Flexible') {
    warnings.push('Tuyến chỉ có 1 đơn không khẩn cấp — cảnh báo không hiệu quả (BR-GRP-006)');
  }
  if (timeline.late_minutes > 0) {
    warnings.push(`Tuyến trễ hẹn ~${timeline.late_minutes} phút`);
  }

  const score = routeScore(timeline, cost, requests.length, vehicleFit);

  const route: EngineRoute = {
    vehicle_id: vehicle.id,
    vehicle_code: vehicle.vehicle_code,
    vehicle_type: vehicle.vehicle_type,
    request_ids: requests.map((r) => r.id),
    stops: timeline.planned,
    departure_time: timeline.departure_time,
    total_distance_km: timeline.total_distance_km,
    total_duration_minutes: timeline.total_duration_minutes,
    total_cost: cost,
    late_minutes: timeline.late_minutes,
    empty_distance_km: timeline.empty_distance_km,
    route_score: score,
    warnings,
    explanation: explain(vehicle, requests, timeline, cost),
  };

  return { route, feasibleCapacity };
}

// Comparator implementing the optimisation priority order (PRD section 10.7):
// 1) not late  2) not overweight  3) lowest cost  4) lowest km  5) lowest time.
export function compareRoutes(a: EngineRoute, b: EngineRoute): number {
  const aLate = a.late_minutes > 0 ? 1 : 0;
  const bLate = b.late_minutes > 0 ? 1 : 0;
  if (aLate !== bLate) return aLate - bLate;
  if (a.total_cost !== b.total_cost) return a.total_cost - b.total_cost;
  if (a.total_distance_km !== b.total_distance_km)
    return a.total_distance_km - b.total_distance_km;
  return a.total_duration_minutes - b.total_duration_minutes;
}

function splitPlan(
  requests: EngineRequest[],
  vehicles: EngineVehicle[],
  depot: GeoPoint,
  dp: DistanceProvider,
  cfg: RoutingConfig,
  currentTime: number,
): EngineRoute[] {
  const routes: EngineRoute[] = [];
  for (const req of requests) {
    const perReq: EngineRoute[] = [];
    for (const vehicle of vehicles) {
      if (!vehicleCanServeRequest(vehicle, req, cfg)) continue;
      const built = buildRoute(vehicle, [req], depot, dp, cfg, currentTime);
      if (built.feasibleCapacity) perReq.push(built.route);
    }
    if (perReq.length > 0) {
      perReq.sort(compareRoutes);
      routes.push(perReq[0]);
    }
  }
  return routes;
}

function totalLate(routes: EngineRoute[]): number {
  return routes.reduce((s, r) => s + r.late_minutes, 0);
}

// Plan a cluster, choosing between a single grouped trip and splitting it.
// BR-GRP-002: only group when it does not make any order late — if the grouped
// route is late but splitting avoids/reduces lateness, prefer the split.
export function planCluster(
  cluster: Cluster,
  vehicles: EngineVehicle[],
  depot: GeoPoint,
  dp: DistanceProvider,
  cfg: RoutingConfig,
  currentTime: number,
): EngineRoute[] {
  const combined: EngineRoute[] = [];
  for (const vehicle of vehicles) {
    const allServable = cluster.requests.every((r) =>
      vehicleCanServeRequest(vehicle, r, cfg),
    );
    if (!allServable) continue;
    const built = buildRoute(vehicle, cluster.requests, depot, dp, cfg, currentTime);
    if (built.feasibleCapacity) combined.push(built.route);
  }
  combined.sort(compareRoutes);
  const bestCombined = combined[0];

  // A single-request cluster never needs splitting.
  if (cluster.requests.length <= 1) {
    return bestCombined
      ? [bestCombined]
      : splitPlan(cluster.requests, vehicles, depot, dp, cfg, currentTime);
  }

  const split = splitPlan(cluster.requests, vehicles, depot, dp, cfg, currentTime);

  if (!bestCombined) return split;
  if (bestCombined.late_minutes === 0) return [bestCombined]; // group: fewer trips

  // Grouped trip is late: prefer the split if it reduces total lateness.
  if (split.length > 0 && totalLate(split) < bestCombined.late_minutes) {
    return split;
  }
  return [bestCombined];
}
