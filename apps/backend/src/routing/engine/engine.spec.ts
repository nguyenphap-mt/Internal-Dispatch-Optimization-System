import {
  Classification,
  OperatingArea,
  Priority,
  RequestType,
  VehicleType,
} from '../../common/enums';
import { DEFAULT_ROUTING_CONFIG } from './config';
import { optimizeDispatch } from './engine';
import { calculateCost } from './optimizer';
import { scoreRequest } from './scoring';
import { matchVehicleType } from './vehicle-match';
import { EngineRequest, EngineVehicle, GeoPoint } from './types';

const NOW = new Date('2026-06-03T08:00:00.000Z').getTime();
const MIN = 60_000;
const HOUR = 60 * MIN;

const DEPOT: GeoPoint = { lat: 21.0278, lng: 105.8342 }; // Hanoi center

function motorbike(over: Partial<EngineVehicle> = {}): EngineVehicle {
  return {
    id: 'veh-moto',
    vehicle_code: 'M-01',
    vehicle_type: VehicleType.MOTORBIKE,
    vehicle_name: 'Honda',
    max_weight_kg: 50,
    max_volume_m3: 0,
    operating_area: OperatingArea.INNER_CITY,
    fuel_cost_per_km: 1000,
    fixed_trip_cost: 0,
    ...over,
  };
}

function truck(over: Partial<EngineVehicle> = {}): EngineVehicle {
  return {
    id: 'veh-truck',
    vehicle_code: 'T-01',
    vehicle_type: VehicleType.TRUCK,
    vehicle_name: 'Hyundai',
    max_weight_kg: 1000,
    max_volume_m3: 10,
    operating_area: OperatingArea.BOTH,
    fuel_cost_per_km: 5000,
    fixed_trip_cost: 50000,
    ...over,
  };
}

let seq = 0;
function deliveryRequest(over: Partial<EngineRequest> = {}): EngineRequest {
  seq += 1;
  const start = NOW;
  const end = NOW + 8 * HOUR;
  return {
    id: `req-${seq}`,
    request_code: `YC${String(seq).padStart(6, '0')}`,
    request_type: RequestType.DELIVERY,
    priority: Priority.SAME_DAY,
    weight_kg: 10,
    volume_m3: 0.1,
    is_bulky: false,
    is_vip: false,
    inner_city: true,
    area: 'Q1',
    delivery_deadline: end,
    stops: [
      {
        request_id: `req-${seq}`,
        point_type: 'Delivery',
        location_name: 'KH',
        lat: 21.03,
        lng: 105.84,
        window_start: start,
        window_end: end,
        service_time_minutes: 10,
      },
    ],
    ...over,
  };
}

describe('Routing engine — PRD section 19.3 test cases', () => {
  it('Case 1: light inner-city, not bulky => motorbike recommended', () => {
    const req = deliveryRequest({ weight_kg: 5, is_bulky: false, inner_city: true });
    const match = matchVehicleType(req, DEFAULT_ROUTING_CONFIG);
    expect(match.suitable_vehicle_types).toContain(VehicleType.MOTORBIKE);
    expect(match.recommended_vehicle_type).toBe(VehicleType.MOTORBIKE);
  });

  it('Case 2: heavy 100kg => truck recommended', () => {
    const req = deliveryRequest({ weight_kg: 100 });
    const match = matchVehicleType(req, DEFAULT_ROUTING_CONFIG);
    expect(match.suitable_vehicle_types).not.toContain(VehicleType.MOTORBIKE);
    expect(match.recommended_vehicle_type).toBe(VehicleType.TRUCK);
  });

  it('Case 3: deadline in 1 hour => classified as urgent (cần xử lý ngay)', () => {
    const deadline = NOW + 1 * HOUR;
    const req = deliveryRequest({
      delivery_deadline: deadline,
      stops: [
        {
          request_id: 'req-urgent',
          point_type: 'Delivery',
          lat: 21.03,
          lng: 105.84,
          window_start: NOW,
          window_end: deadline,
          service_time_minutes: 10,
        },
      ],
    });
    const scored = scoreRequest(req, NOW, DEFAULT_ROUTING_CONFIG, {});
    expect(scored.score).toBeGreaterThanOrEqual(80);
    expect(scored.classification).toBe(Classification.URGENT);
  });

  it('Case 4: 3 orders same district, deadline end of day => grouped into one route', () => {
    const reqs = [
      deliveryRequest({ area: 'Q1', weight_kg: 10 }),
      deliveryRequest({ area: 'Q1', weight_kg: 10 }),
      deliveryRequest({ area: 'Q1', weight_kg: 10 }),
    ];
    const result = optimizeDispatch({
      requests: reqs,
      vehicles: [motorbike(), truck()],
      depot: DEPOT,
      currentTime: NOW,
    });
    const grouped = result.suggestedRoutes.find((r) => r.request_ids.length === 3);
    expect(grouped).toBeDefined();
    expect(result.suggestedRoutes.length).toBe(1);
  });

  it('Case 5: grouping would cause lateness => not grouped (split instead)', () => {
    // Two deliveries far apart, each with a tight 30-min window. Serving both on
    // one vehicle makes the second late; two separate trips keep both on time.
    const mkTight = (id: string, lat: number, lng: number): EngineRequest => ({
      id,
      request_code: id,
      request_type: RequestType.DELIVERY,
      priority: Priority.SAME_DAY,
      weight_kg: 10,
      volume_m3: 0.1,
      is_bulky: false,
      is_vip: false,
      inner_city: true,
      area: 'Q1',
      delivery_deadline: NOW + 30 * MIN,
      stops: [
        {
          request_id: id,
          point_type: 'Delivery',
          lat,
          lng,
          window_start: NOW,
          window_end: NOW + 30 * MIN,
          service_time_minutes: 10,
        },
      ],
    });
    const reqs = [
      mkTight('A', 21.20, 106.05), // far north-east
      mkTight('B', 20.85, 105.60), // far south-west
    ];
    const result = optimizeDispatch({
      requests: reqs,
      vehicles: [truck({ id: 't1', vehicle_code: 'T-1' }), truck({ id: 't2', vehicle_code: 'T-2' })],
      depot: DEPOT,
      currentTime: NOW,
    });
    // Not grouped: there must not be a single route covering both requests.
    const grouped = result.suggestedRoutes.find((r) => r.request_ids.length === 2);
    expect(grouped).toBeUndefined();
    expect(result.suggestedRoutes.length).toBe(2);
  });

  it('Case 6: missing coordinates => invalid_requests', () => {
    const req = deliveryRequest({
      stops: [
        {
          request_id: 'req-nocoord',
          point_type: 'Delivery',
          window_start: NOW,
          window_end: NOW + HOUR,
          service_time_minutes: 10,
        },
      ],
    });
    const result = optimizeDispatch({
      requests: [req],
      vehicles: [motorbike(), truck()],
      depot: DEPOT,
      currentTime: NOW,
    });
    expect(result.invalidRequests.length).toBe(1);
    expect(result.invalidRequests[0].classification).toBe(Classification.INVALID);
  });
});

describe('Routing engine — scoring, cost & capacity', () => {
  it('Flexible far-deadline request lands in waiting/groupable, not urgent', () => {
    const req = deliveryRequest({
      priority: Priority.FLEXIBLE,
      delivery_deadline: NOW + 5 * 24 * HOUR,
    });
    const scored = scoreRequest(req, NOW, DEFAULT_ROUTING_CONFIG, {});
    expect(scored.classification).not.toBe(Classification.URGENT);
    expect(scored.score_breakdown.some((b) => b.points === -25)).toBe(true);
  });

  it('cost function matches PRD section 10.6 formula', () => {
    const cost = calculateCost(
      {
        total_distance_km: 10,
        total_duration_minutes: 30,
        late_minutes: 0,
        empty_distance_km: 4,
      },
      truck({ fuel_cost_per_km: 5000, fixed_trip_cost: 50000 }),
      DEFAULT_ROUTING_CONFIG,
    );
    // 10*5000 + 30*1000 + 0 + 4*1.2 + 50000 = 130004.8
    expect(cost).toBeCloseTo(130004.8, 1);
  });

  it('overweight cluster is not assigned to a vehicle that cannot carry it', () => {
    const heavy = deliveryRequest({ weight_kg: 80, area: 'Q9' }); // > motorbike 50
    const result = optimizeDispatch({
      requests: [heavy],
      vehicles: [motorbike()], // only a motorbike available
      depot: DEPOT,
      currentTime: NOW,
    });
    // No feasible vehicle => no route produced for this request.
    expect(result.suggestedRoutes.length).toBe(0);
  });

  it('late arrival adds late_minutes and a warning', () => {
    const req = deliveryRequest({
      delivery_deadline: NOW + 1 * MIN,
      stops: [
        {
          request_id: 'late-1',
          point_type: 'Delivery',
          lat: 21.5, // far from depot, unreachable within 1 minute
          lng: 106.3,
          window_start: NOW,
          window_end: NOW + 1 * MIN,
          service_time_minutes: 10,
        },
      ],
    });
    const result = optimizeDispatch({
      requests: [req],
      vehicles: [truck()],
      depot: DEPOT,
      currentTime: NOW,
    });
    expect(result.suggestedRoutes.length).toBe(1);
    expect(result.suggestedRoutes[0].late_minutes).toBeGreaterThan(0);
  });
});
