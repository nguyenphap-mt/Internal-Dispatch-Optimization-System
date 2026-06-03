import { PointType } from '../common/enums';
import { DispatchRequest } from './entities/dispatch-request.entity';
import { EngineRequest, EngineStop } from '../routing/engine/types';

function toMs(d?: Date | string | null): number | undefined {
  if (!d) return undefined;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? undefined : t;
}

// Convert a persisted DispatchRequest (+points) into the engine's normalized form.
export function toEngineRequest(req: DispatchRequest): EngineRequest {
  const stops: EngineStop[] = (req.points ?? [])
    .filter((p) => p.point_type !== PointType.DEPOT)
    .map((p) => ({
      request_id: req.id,
      dispatch_point_id: p.id,
      point_type: p.point_type === PointType.PICKUP ? 'Pickup' : 'Delivery',
      location_name: p.location_name,
      lat: p.lat != null ? Number(p.lat) : undefined,
      lng: p.lng != null ? Number(p.lng) : undefined,
      window_start: toMs(p.time_window_start),
      window_end: toMs(p.time_window_end),
      service_time_minutes: p.service_time_minutes ?? 10,
    }));

  const pickupDeadlines = (req.points ?? [])
    .filter((p) => p.point_type === PointType.PICKUP)
    .map((p) => toMs(p.time_window_end))
    .filter((t): t is number => typeof t === 'number');
  const deliveryDeadlines = (req.points ?? [])
    .filter((p) => p.point_type === PointType.DELIVERY)
    .map((p) => toMs(p.time_window_end))
    .filter((t): t is number => typeof t === 'number');

  return {
    id: req.id,
    request_code: req.request_code,
    request_type: req.request_type,
    priority: req.priority,
    weight_kg: Number(req.weight_kg) || 0,
    volume_m3: Number(req.volume_m3) || 0,
    is_bulky: req.is_bulky,
    is_vip: req.is_vip,
    inner_city: req.inner_city,
    area: req.area,
    pickup_deadline: pickupDeadlines.length
      ? Math.min(...pickupDeadlines)
      : undefined,
    delivery_deadline: deliveryDeadlines.length
      ? Math.min(...deliveryDeadlines)
      : undefined,
    stops,
  };
}
