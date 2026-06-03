import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthUser } from '../common/decorators';
import {
  PointType,
  RequestStatus,
  RoutePlanStatus,
  RouteStopStatus,
} from '../common/enums';
import { DispatchRequestsService } from '../dispatch-requests/dispatch-requests.service';
import { EngineRoute } from '../routing/engine/types';
import { DispatcherOverride } from './entities/dispatcher-override.entity';
import { RoutePlan } from './entities/route-plan.entity';
import { RouteStop } from '../route-stops/entities/route-stop.entity';

@Injectable()
export class RoutePlansService {
  constructor(
    @InjectRepository(RoutePlan)
    private readonly plans: Repository<RoutePlan>,
    @InjectRepository(RouteStop)
    private readonly stops: Repository<RouteStop>,
    @InjectRepository(DispatcherOverride)
    private readonly overrides: Repository<DispatcherOverride>,
    private readonly requests: DispatchRequestsService,
  ) {}

  private async nextCode(): Promise<string> {
    const count = await this.plans.count();
    return `RT${String(count + 1).padStart(6, '0')}`;
  }

  // Persist engine-suggested routes as Draft route plans and mark their
  // requests as Planned (PRD status flow section 8).
  async createFromRoutes(
    routes: EngineRoute[],
    optimizationRunId: string,
  ): Promise<RoutePlan[]> {
    const saved: RoutePlan[] = [];
    for (const r of routes) {
      const plan = this.plans.create({
        route_code: await this.nextCode(),
        vehicle_id: r.vehicle_id,
        status: RoutePlanStatus.DRAFT,
        departure_time: new Date(r.departure_time),
        estimated_distance_km: r.total_distance_km,
        estimated_duration_minutes: r.total_duration_minutes,
        estimated_cost: r.total_cost,
        optimization_run_id: optimizationRunId,
        warnings: r.warnings,
        explanation: r.explanation,
        stops: r.stops.map((s) =>
          this.stops.create({
            request_id: s.request_id,
            dispatch_point_id: s.dispatch_point_id,
            point_type:
              s.point_type === 'Pickup' ? PointType.PICKUP : PointType.DELIVERY,
            location_name: s.location_name,
            lat: s.lat,
            lng: s.lng,
            stop_sequence: s.stop_sequence,
            planned_arrival_time: new Date(s.planned_arrival_time),
            planned_departure_time: new Date(s.planned_departure_time),
            status: RouteStopStatus.PENDING,
          }),
        ),
      });
      const persisted = await this.plans.save(plan);
      await this.requests.setStatus(r.request_ids, RequestStatus.PLANNED);
      saved.push(persisted);
    }
    return saved;
  }

  findAll(status?: RoutePlanStatus) {
    return this.plans.find({
      where: status ? { status } : {},
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const plan = await this.plans.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Không tìm thấy tuyến');
    return plan;
  }

  private requestIdsOf(plan: RoutePlan): string[] {
    return Array.from(new Set((plan.stops ?? []).map((s) => s.request_id).filter(Boolean)));
  }

  async approve(id: string, user: AuthUser) {
    const plan = await this.findOne(id);
    if (plan.status !== RoutePlanStatus.DRAFT) {
      throw new BadRequestException('Chỉ duyệt được tuyến ở trạng thái nháp');
    }
    plan.status = RoutePlanStatus.APPROVED;
    plan.approved_by = user.id;
    plan.approved_at = new Date();
    return this.plans.save(plan);
  }

  async assign(
    id: string,
    body: { vehicle_id?: string; driver_id: string },
    user: AuthUser,
  ) {
    const plan = await this.findOne(id);
    if (
      plan.status !== RoutePlanStatus.APPROVED &&
      plan.status !== RoutePlanStatus.ASSIGNED
    ) {
      throw new BadRequestException('Tuyến phải được duyệt trước khi phân tài xế');
    }
    const old = { vehicle_id: plan.vehicle_id, driver_id: plan.driver_id };
    if (body.vehicle_id) plan.vehicle_id = body.vehicle_id;
    plan.driver_id = body.driver_id;
    plan.status = RoutePlanStatus.ASSIGNED;
    await this.plans.save(plan);
    await this.requests.setStatus(this.requestIdsOf(plan), RequestStatus.ASSIGNED);
    await this.logOverride(plan.id, user.id, 'assign', old, {
      vehicle_id: plan.vehicle_id,
      driver_id: plan.driver_id,
    });
    return this.findOne(plan.id);
  }

  // BR-DIS-004: a driver cannot start a route that is not yet Assigned.
  async start(id: string) {
    const plan = await this.findOne(id);
    if (plan.status !== RoutePlanStatus.ASSIGNED) {
      throw new BadRequestException('Tuyến chưa được phân (Assigned) nên không thể bắt đầu');
    }
    plan.status = RoutePlanStatus.IN_PROGRESS;
    const saved = await this.plans.save(plan);
    await this.requests.setStatus(this.requestIdsOf(plan), RequestStatus.IN_PROGRESS);
    return saved;
  }

  async complete(id: string) {
    const plan = await this.findOne(id);
    plan.status = RoutePlanStatus.COMPLETED;
    const saved = await this.plans.save(plan);
    await this.requests.setStatus(this.requestIdsOf(plan), RequestStatus.COMPLETED);
    return saved;
  }

  async cancel(id: string, user: AuthUser, reason?: string) {
    const plan = await this.findOne(id);
    const old = { status: plan.status };
    plan.status = RoutePlanStatus.CANCELLED;
    const saved = await this.plans.save(plan);
    await this.requests.setStatus(
      this.requestIdsOf(plan),
      RequestStatus.WAITING_DISPATCH,
    );
    await this.logOverride(plan.id, user.id, 'cancel', old, {
      status: plan.status,
      reason,
    });
    return saved;
  }

  // BR-DIS-003: every manual change must store a reason.
  async reorderStops(
    id: string,
    stopOrder: Array<{ stop_id: string; stop_sequence: number }>,
    reason: string,
    user: AuthUser,
  ) {
    if (!reason) {
      throw new BadRequestException('Phải nhập lý do khi chỉnh tuyến (BR-DIS-003)');
    }
    const plan = await this.findOne(id);
    const before = plan.stops.map((s) => ({ id: s.id, seq: s.stop_sequence }));
    for (const item of stopOrder) {
      const stop = plan.stops.find((s) => s.id === item.stop_id);
      if (stop) stop.stop_sequence = item.stop_sequence;
    }
    await this.stops.save(plan.stops);
    await this.logOverride(plan.id, user.id, 'reorder_stops', before, stopOrder, reason);
    return this.findOne(id);
  }

  private logOverride(
    routePlanId: string,
    changedBy: string,
    changeType: string,
    oldValue: unknown,
    newValue: unknown,
    reason = 'system',
  ) {
    return this.overrides.save(
      this.overrides.create({
        route_plan_id: routePlanId,
        changed_by: changedBy,
        change_type: changeType,
        old_value: oldValue,
        new_value: newValue,
        reason,
      }),
    );
  }

  // Driver-facing helpers.
  driverRoutesToday(driverId: string) {
    return this.plans.find({
      where: { driver_id: driverId },
      order: { departure_time: 'ASC' },
    });
  }

  getStop(stopId: string) {
    return this.stops.findOne({ where: { id: stopId } });
  }

  saveStop(stop: RouteStop) {
    return this.stops.save(stop);
  }

  async maybeCompletePlan(routePlanId: string) {
    const plan = await this.findOne(routePlanId);
    const allDone = plan.stops.every(
      (s) =>
        s.status === RouteStopStatus.DELIVERY_COMPLETED ||
        s.status === RouteStopStatus.PICKUP_COMPLETED ||
        s.status === RouteStopStatus.FAILED,
    );
    if (allDone && plan.status === RoutePlanStatus.IN_PROGRESS) {
      await this.complete(routePlanId);
    }
  }

  allForReports() {
    return this.plans.find();
  }
}
