import { VehicleType } from '../../common/enums';
import { RoutingConfig } from './config';
import { motorbikeSuitable, truckSuitable } from './scoring';
import { EngineRequest, EngineVehicle, VehicleMatch } from './types';

// Recommend a vehicle type for a request per the BR-VEH rules (PRD section 9.3).
export function matchVehicleType(
  req: EngineRequest,
  cfg: RoutingConfig,
): VehicleMatch {
  const reasons: string[] = [];
  const suitable: VehicleType[] = [];

  const moto = motorbikeSuitable(req, cfg);
  const truck = truckSuitable(req, cfg);

  if (moto) {
    suitable.push(VehicleType.MOTORBIKE);
    reasons.push('Xe máy: hàng nhẹ, không cồng kềnh, nội thành (BR-VEH-001/002/003)');
  }
  if (truck) {
    suitable.push(VehicleType.TRUCK);
    reasons.push('Xe tải: nhận hàng nặng/cồng kềnh/ngoại thành (BR-VEH-004/005/006)');
  }

  let recommended: VehicleType | null = null;
  if (suitable.length === 0) {
    reasons.push('Không có loại xe phù hợp với cấu hình hiện tại');
  } else if (suitable.length === 1) {
    recommended = suitable[0];
  } else {
    // BR-VEH-007: both fit -> pick the cheaper one (motorbike fuel cost is lower).
    recommended =
      cfg.motorbike_fuel_cost_per_km <= cfg.truck_fuel_cost_per_km
        ? VehicleType.MOTORBIKE
        : VehicleType.TRUCK;
    reasons.push('Cả hai phù hợp -> chọn xe chi phí thấp hơn (BR-VEH-007)');
  }

  return {
    request_id: req.id,
    suitable_vehicle_types: suitable,
    recommended_vehicle_type: recommended,
    reasons,
  };
}

// True if a concrete vehicle can physically serve a request (weight/volume/area).
export function vehicleCanServeRequest(
  vehicle: EngineVehicle,
  req: EngineRequest,
  cfg: RoutingConfig,
): boolean {
  if (req.weight_kg > vehicle.max_weight_kg) return false; // BR-VEH-009
  if (vehicle.max_volume_m3 > 0 && req.volume_m3 > vehicle.max_volume_m3) {
    return false; // BR-VEH-010
  }
  if (vehicle.vehicle_type === VehicleType.MOTORBIKE) {
    return motorbikeSuitable(req, cfg);
  }
  return truckSuitable(req, cfg);
}

export function matchVehicles(
  requests: EngineRequest[],
  cfg: RoutingConfig,
): VehicleMatch[] {
  return requests.map((r) => matchVehicleType(r, cfg));
}
