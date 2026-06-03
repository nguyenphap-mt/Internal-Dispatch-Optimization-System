import { Classification, Priority } from '../../common/enums';
import { RoutingConfig } from './config';
import { hasCoords } from './geo';
import { EngineRequest, ScoredRequest } from './types';

const MS_PER_MINUTE = 60_000;

function minutesUntil(deadline: number | undefined, now: number): number | null {
  if (!deadline) return null;
  return (deadline - now) / MS_PER_MINUTE;
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

// Validate a request against the BR-DATA rules (PRD section 9.1).
// Returns a list of human-readable reasons; empty => valid.
export function validateRequest(req: EngineRequest, now: number): string[] {
  const reasons: string[] = [];

  if (!req.stops || req.stops.length === 0) {
    reasons.push('BR-DATA-001: thiếu điểm lấy/giao');
    return reasons;
  }

  for (const stop of req.stops) {
    // BR-DATA-004: address that cannot be geocoded => needs review (invalid for routing).
    if (!hasCoords(stop)) {
      reasons.push(`BR-DATA-004: điểm ${stop.point_type} thiếu tọa độ`);
    }
    // BR-DATA-002: time window required.
    if (stop.window_start == null || stop.window_end == null) {
      reasons.push(`BR-DATA-002: điểm ${stop.point_type} thiếu thời gian`);
    }
    // BR-DATA-006: end must be after start.
    if (
      stop.window_start != null &&
      stop.window_end != null &&
      stop.window_end <= stop.window_start
    ) {
      reasons.push(`BR-DATA-006: thời gian kết thúc phải lớn hơn bắt đầu`);
    }
  }

  // BR-DATA-003: weight required.
  if (!(req.weight_kg > 0)) {
    reasons.push('BR-DATA-003: thiếu khối lượng');
  }

  // BR-DATA-007: deadline must not be in the past.
  const deadline = effectiveDeadline(req);
  if (deadline != null && deadline < now) {
    reasons.push('BR-DATA-007: deadline trong quá khứ');
  }

  return reasons;
}

export function effectiveDeadline(req: EngineRequest): number | undefined {
  const candidates = [req.delivery_deadline, req.pickup_deadline].filter(
    (d): d is number => typeof d === 'number',
  );
  if (candidates.length === 0) return undefined;
  return Math.min(...candidates);
}

export function motorbikeSuitable(req: EngineRequest, cfg: RoutingConfig): boolean {
  if (req.is_bulky) return false; // BR-VEH-003
  if (req.weight_kg > cfg.motorbike_max_weight_kg) return false; // BR-VEH-002
  if (cfg.motorbike_inner_city_only && !req.inner_city) return false; // BR-VEH-001
  return true;
}

export function truckSuitable(req: EngineRequest, cfg: RoutingConfig): boolean {
  return req.weight_kg <= cfg.truck_max_weight_kg; // BR-VEH-004/005/006
}

export function classify(score: number): Classification {
  if (score < 0) return Classification.INVALID;
  if (score >= 80) return Classification.URGENT;
  if (score >= 50) return Classification.NEXT_TRIP;
  if (score >= 20) return Classification.GROUPABLE;
  return Classification.WAITING;
}

// Score a single request per PRD section 10.5. areaCounts maps area key -> count
// of requests sharing that area (used for the "same area as many others" bonus).
export function scoreRequest(
  req: EngineRequest,
  now: number,
  cfg: RoutingConfig,
  areaCounts: Record<string, number>,
): ScoredRequest {
  const breakdown: Array<{ reason: string; points: number }> = [];
  const invalidReasons = validateRequest(req, now);

  const add = (reason: string, points: number) => {
    if (points !== 0) breakdown.push({ reason, points });
  };

  if (invalidReasons.length > 0) {
    add('Thiếu dữ liệu', -100); // section 10.5
  }

  const deliveryMin = minutesUntil(req.delivery_deadline, now);
  const pickupMin = minutesUntil(req.pickup_deadline, now);
  const threshold = cfg.urgent_threshold_minutes;

  if (deliveryMin != null && deliveryMin <= threshold) {
    add('Gần deadline giao (< ngưỡng gấp)', 50); // BR-URG-002
  }
  if (pickupMin != null && pickupMin <= threshold) {
    add('Gần deadline lấy (< ngưỡng gấp)', 40); // BR-URG-003
  }
  if (req.priority === Priority.URGENT) {
    add('Ưu tiên khẩn cấp', 40); // BR-URG-001
  }

  const deadline = effectiveDeadline(req);
  if (deadline != null && isSameDay(deadline, now)) {
    add('Deadline hôm nay', 25); // BR-URG-004
  }

  const areaKey = req.area ?? '';
  if (areaKey && (areaCounts[areaKey] ?? 0) >= cfg.minimum_group_size_for_trip) {
    add('Cùng khu vực với nhiều đơn khác', 20);
  }

  if (motorbikeSuitable(req, cfg)) {
    add('Phù hợp xe máy', 10);
  }
  if (truckSuitable(req, cfg)) {
    add('Phù hợp xe tải', 10);
  }
  if (req.is_vip) {
    add('Khách quan trọng (VIP)', 15);
  }
  if (req.priority === Priority.FLEXIBLE) {
    add('Linh hoạt', -25); // BR-URG-005
  }

  const score = breakdown.reduce((sum, b) => sum + b.points, 0);
  const classification =
    invalidReasons.length > 0 ? Classification.INVALID : classify(score);

  return {
    ...req,
    score,
    classification,
    score_breakdown: breakdown,
    invalid_reasons: invalidReasons,
  };
}

// Score and classify a batch of requests.
export function scoreRequests(
  requests: EngineRequest[],
  now: number,
  cfg: RoutingConfig,
): ScoredRequest[] {
  const areaCounts: Record<string, number> = {};
  for (const r of requests) {
    const key = r.area ?? '';
    if (!key) continue;
    areaCounts[key] = (areaCounts[key] ?? 0) + 1;
  }
  return requests.map((r) => scoreRequest(r, now, cfg, areaCounts));
}
