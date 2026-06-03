import {
  Classification,
  OperatingArea,
  Priority,
  RequestType,
  VehicleType,
} from '../../common/enums';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface EngineStop extends Partial<GeoPoint> {
  request_id: string;
  dispatch_point_id?: string;
  point_type: 'Pickup' | 'Delivery';
  location_name?: string;
  // Earliest/latest service time (epoch ms). undefined => unconstrained.
  window_start?: number;
  window_end?: number;
  service_time_minutes: number;
}

// Normalized request handed to the engine. Times are epoch milliseconds.
export interface EngineRequest {
  id: string;
  request_code: string;
  request_type: RequestType;
  priority: Priority;
  weight_kg: number;
  volume_m3: number;
  is_bulky: boolean;
  is_vip: boolean;
  inner_city: boolean;
  // Hard deadline for the latest required action (ms). Used for urgency scoring.
  pickup_deadline?: number;
  delivery_deadline?: number;
  // Area key for clustering (e.g. district name); falls back to a geo bucket.
  area?: string;
  stops: EngineStop[];
}

export interface EngineVehicle {
  id: string;
  vehicle_code: string;
  vehicle_type: VehicleType;
  vehicle_name: string;
  max_weight_kg: number;
  max_volume_m3: number;
  operating_area: OperatingArea;
  fuel_cost_per_km: number;
  fixed_trip_cost: number;
  // Earliest time the vehicle is available (ms). Defaults to now.
  available_at?: number;
}

export interface ScoredRequest extends EngineRequest {
  score: number;
  classification: Classification;
  score_breakdown: Array<{ reason: string; points: number }>;
  invalid_reasons: string[];
}

export interface VehicleMatch {
  request_id: string;
  suitable_vehicle_types: VehicleType[];
  recommended_vehicle_type: VehicleType | null;
  reasons: string[];
}

export interface PlannedStop extends EngineStop {
  stop_sequence: number;
  planned_arrival_time: number;
  planned_departure_time: number;
  late_minutes: number;
}

export interface EngineRoute {
  vehicle_id: string;
  vehicle_code: string;
  vehicle_type: VehicleType;
  request_ids: string[];
  stops: PlannedStop[];
  departure_time: number;
  total_distance_km: number;
  total_duration_minutes: number;
  total_cost: number;
  late_minutes: number;
  empty_distance_km: number;
  route_score: number;
  warnings: string[];
  explanation: string;
}

export interface OptimizeInput {
  requests: EngineRequest[];
  vehicles: EngineVehicle[];
  depot: GeoPoint;
  currentTime: number;
}

export interface OptimizeResult {
  urgentRequests: ScoredRequest[];
  nextTripRequests: ScoredRequest[];
  groupableRequests: ScoredRequest[];
  waitingRequests: ScoredRequest[];
  invalidRequests: ScoredRequest[];
  vehicleMatches: VehicleMatch[];
  suggestedRoutes: EngineRoute[];
  totalCost: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  warnings: string[];
  explanation: string;
}
