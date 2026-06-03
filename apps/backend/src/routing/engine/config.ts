// Routing configuration. Defaults come from PRD section 15.
export interface RoutingConfig {
  urgent_threshold_minutes: number;
  motorbike_max_weight_kg: number;
  motorbike_inner_city_only: boolean;
  truck_max_weight_kg: number;
  service_time_per_stop_minutes: number;
  minimum_group_size_for_trip: number;
  late_penalty_per_minute: number;
  empty_run_penalty: number;
  max_waiting_time_for_grouping_minutes: number;
  default_driver_cost_per_minute: number;
  motorbike_fuel_cost_per_km: number;
  truck_fuel_cost_per_km: number;
  default_depot_lat: number | null;
  default_depot_lng: number | null;
  // Average travel speed used by the Haversine fallback when OSRM is unavailable.
  fallback_speed_kmh: number;
}

export const DEFAULT_ROUTING_CONFIG: RoutingConfig = {
  urgent_threshold_minutes: 120,
  motorbike_max_weight_kg: 50,
  motorbike_inner_city_only: true,
  truck_max_weight_kg: 1000,
  service_time_per_stop_minutes: 10,
  minimum_group_size_for_trip: 2,
  late_penalty_per_minute: 10000,
  empty_run_penalty: 1.2,
  max_waiting_time_for_grouping_minutes: 120,
  default_driver_cost_per_minute: 1000,
  motorbike_fuel_cost_per_km: 1000,
  truck_fuel_cost_per_km: 5000,
  default_depot_lat: null,
  default_depot_lng: null,
  fallback_speed_kmh: 25,
};
