import { Injectable } from '@nestjs/common';
import { AuthUser } from '../common/decorators';
import { Classification, OperatingArea } from '../common/enums';
import { DispatchRequestsService } from '../dispatch-requests/dispatch-requests.service';
import { toEngineRequest } from '../dispatch-requests/request-mapper';
import { DispatchRequest } from '../dispatch-requests/entities/dispatch-request.entity';
import { OptimizationService } from '../optimization/optimization.service';
import { RoutePlansService } from '../route-plans/route-plans.service';
import { SettingsService } from '../settings/settings.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { RoutingConfig } from './engine/config';
import { optimizeDispatch } from './engine/engine';
import { buildRoute } from './engine/optimizer';
import { scoreRequests } from './engine/scoring';
import { matchVehicles } from './engine/vehicle-match';
import {
  EngineRequest,
  EngineVehicle,
  GeoPoint,
  OptimizeResult,
} from './engine/types';
import { OsrmService } from './osrm.service';

function toEngineVehicle(v: Vehicle): EngineVehicle {
  return {
    id: v.id,
    vehicle_code: v.vehicle_code,
    vehicle_type: v.vehicle_type,
    vehicle_name: v.vehicle_name,
    max_weight_kg: Number(v.max_weight_kg) || 0,
    max_volume_m3: Number(v.max_volume_m3) || 0,
    operating_area: v.operating_area ?? OperatingArea.BOTH,
    fuel_cost_per_km: Number(v.fuel_cost_per_km) || 0,
    fixed_trip_cost: Number(v.fixed_trip_cost) || 0,
  };
}

@Injectable()
export class RoutingService {
  constructor(
    private readonly requests: DispatchRequestsService,
    private readonly vehicles: VehiclesService,
    private readonly settings: SettingsService,
    private readonly osrm: OsrmService,
    private readonly optimization: OptimizationService,
    private readonly plans: RoutePlansService,
  ) {}

  private async loadRequests(ids?: string[]): Promise<DispatchRequest[]> {
    if (ids && ids.length > 0) return this.requests.findByIds(ids);
    return this.requests.waitingForDispatch();
  }

  private collectPoints(
    engineRequests: EngineRequest[],
    depot: GeoPoint,
  ): GeoPoint[] {
    const points: GeoPoint[] = [depot];
    for (const r of engineRequests) {
      for (const s of r.stops) {
        if (typeof s.lat === 'number' && typeof s.lng === 'number') {
          points.push({ lat: s.lat, lng: s.lng });
        }
      }
    }
    return points;
  }

  private async run(
    ids: string[] | undefined,
  ): Promise<{
    result: OptimizeResult;
    cfg: RoutingConfig;
    entities: DispatchRequest[];
    engineRequests: EngineRequest[];
  }> {
    const [cfg, depot, entities, vehicleEntities] = await Promise.all([
      this.settings.getRoutingConfig(),
      this.settings.getDepot(),
      this.loadRequests(ids),
      this.vehicles.findAll(true),
    ]);
    const engineRequests = entities.map(toEngineRequest);
    const engineVehicles = vehicleEntities.map(toEngineVehicle);
    const provider = await this.osrm.buildProvider(
      this.collectPoints(engineRequests, depot),
      cfg,
    );
    const result = optimizeDispatch(
      { requests: engineRequests, vehicles: engineVehicles, depot, currentTime: Date.now() },
      cfg,
      provider,
    );
    return { result, cfg, entities, engineRequests };
  }

  // Persist computed scores/classification back onto the request rows.
  private async persistScores(
    entities: DispatchRequest[],
    result: OptimizeResult,
  ) {
    const all = [
      ...result.urgentRequests,
      ...result.nextTripRequests,
      ...result.groupableRequests,
      ...result.waitingRequests,
      ...result.invalidRequests,
    ];
    const byId = new Map(all.map((r) => [r.id, r]));
    const toSave: DispatchRequest[] = [];
    for (const e of entities) {
      const scored = byId.get(e.id);
      if (scored) {
        e.score = scored.score;
        e.classification = scored.classification;
        toSave.push(e);
      }
    }
    if (toSave.length > 0) await this.requests.saveAll(toSave);
  }

  async scoreRequestsOnly(ids?: string[]) {
    const [cfg, entities] = await Promise.all([
      this.settings.getRoutingConfig(),
      this.loadRequests(ids),
    ]);
    const scored = scoreRequests(entities.map(toEngineRequest), Date.now(), cfg);
    // persist
    const byId = new Map(scored.map((r) => [r.id, r]));
    for (const e of entities) {
      const s = byId.get(e.id);
      if (s) {
        e.score = s.score;
        e.classification = s.classification;
      }
    }
    await this.requests.saveAll(entities);
    return scored;
  }

  async classifyRequests(ids?: string[]) {
    const scored = await this.scoreRequestsOnly(ids);
    return {
      urgent: scored.filter((r) => r.classification === Classification.URGENT),
      nextTrip: scored.filter((r) => r.classification === Classification.NEXT_TRIP),
      groupable: scored.filter((r) => r.classification === Classification.GROUPABLE),
      waiting: scored.filter((r) => r.classification === Classification.WAITING),
      invalid: scored.filter((r) => r.classification === Classification.INVALID),
    };
  }

  async vehicleMatch(ids?: string[]) {
    const [cfg, entities] = await Promise.all([
      this.settings.getRoutingConfig(),
      this.loadRequests(ids),
    ]);
    return matchVehicles(entities.map(toEngineRequest), cfg);
  }

  async preview(ids?: string[]): Promise<OptimizeResult> {
    const { result } = await this.run(ids);
    return result;
  }

  async optimize(user: AuthUser, ids?: string[], runType = 'optimize') {
    const { result, entities } = await this.run(ids);
    await this.persistScores(entities, result);
    const run = await this.optimization.record({
      runType,
      input: { request_ids: entities.map((e) => e.id) },
      output: {
        suggestedRoutes: result.suggestedRoutes,
        warnings: result.warnings,
        explanation: result.explanation,
      },
      totalCost: result.totalCost,
      totalDistanceKm: result.totalDistanceKm,
      totalDurationMinutes: result.totalDurationMinutes,
      createdBy: user.id,
    });
    const createdPlans = await this.plans.createFromRoutes(
      result.suggestedRoutes,
      run.id,
    );
    return {
      optimization_run_id: run.id,
      ...result,
      created_route_plan_ids: createdPlans.map((p) => p.id),
    };
  }

  recalculate(user: AuthUser, ids?: string[]) {
    return this.optimize(user, ids, 'recalculate');
  }

  // Compute the cost of an ad-hoc route (set of requests on one vehicle).
  async routeCost(requestIds: string[], vehicleId: string) {
    const [cfg, depot, entities, vehicle] = await Promise.all([
      this.settings.getRoutingConfig(),
      this.settings.getDepot(),
      this.requests.findByIds(requestIds),
      this.vehicles.findOne(vehicleId),
    ]);
    const engineRequests = entities.map(toEngineRequest);
    const provider = await this.osrm.buildProvider(
      this.collectPoints(engineRequests, depot),
      cfg,
    );
    const built = buildRoute(
      toEngineVehicle(vehicle),
      engineRequests,
      depot,
      provider,
      cfg,
      Date.now(),
    );
    return built.route;
  }

  getConfig() {
    return this.settings.getRoutingConfig();
  }

  updateConfig(patch: Partial<RoutingConfig>) {
    return this.settings.updateRoutingConfig(patch);
  }
}
