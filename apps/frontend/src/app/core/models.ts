export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role_code: string;
  permissions: string[];
  department?: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface DispatchPoint {
  id?: string;
  point_type: 'Pickup' | 'Delivery' | 'Depot';
  location_name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  contact_name?: string;
  contact_phone?: string;
  time_window_start?: string;
  time_window_end?: string;
  service_time_minutes?: number;
}

export interface DispatchRequest {
  id: string;
  request_code: string;
  request_type: string;
  priority: string;
  status: string;
  weight_kg: number;
  volume_m3: number;
  area?: string;
  inner_city: boolean;
  is_vip: boolean;
  score: number;
  classification?: string;
  note?: string;
  created_at: string;
  points?: DispatchPoint[];
}

export interface PlannedStop {
  id?: string;
  request_id: string;
  point_type: string;
  location_name?: string;
  lat?: number;
  lng?: number;
  stop_sequence: number;
  planned_arrival_time?: string;
  status?: string;
}

export interface RoutePlan {
  id: string;
  route_code: string;
  vehicle_id?: string;
  driver_id?: string;
  vehicle?: { vehicle_code: string; vehicle_type: string };
  driver?: { full_name: string };
  status: string;
  departure_time?: string;
  estimated_distance_km: number;
  estimated_duration_minutes: number;
  estimated_cost: number;
  warnings?: string[];
  explanation?: string;
  stops?: PlannedStop[];
}

export interface OptimizeResult {
  optimization_run_id?: string;
  urgentRequests: DispatchRequest[];
  nextTripRequests: DispatchRequest[];
  groupableRequests: DispatchRequest[];
  waitingRequests: DispatchRequest[];
  invalidRequests: DispatchRequest[];
  suggestedRoutes: RoutePlan[];
  totalCost: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  warnings: string[];
  explanation: string;
  created_route_plan_ids?: string[];
}

export interface Vehicle {
  id: string;
  vehicle_code: string;
  vehicle_type: string;
  vehicle_name: string;
  max_weight_kg: number;
  active: boolean;
}

export interface Driver {
  id: string;
  full_name: string;
  phone?: string;
}

export interface Dashboard {
  date: string;
  requests: {
    total: number;
    by_status: Record<string, number>;
    by_classification: Record<string, number>;
    completed: number;
  };
  routes: {
    total: number;
    completed: number;
    total_distance_km: number;
    total_cost: number;
  };
  on_time: { rate: number; completed_stops: number; on_time_stops: number };
}
