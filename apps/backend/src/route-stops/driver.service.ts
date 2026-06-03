import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '../common/decorators';
import { RequestStatus, RouteStopStatus, PointType } from '../common/enums';
import { DispatchRequestsService } from '../dispatch-requests/dispatch-requests.service';
import { DriversService } from '../drivers/drivers.service';
import { RoutePlansService } from '../route-plans/route-plans.service';

@Injectable()
export class DriverService {
  constructor(
    private readonly drivers: DriversService,
    private readonly plans: RoutePlansService,
    private readonly requests: DispatchRequestsService,
  ) {}

  private async driverIdFor(user: AuthUser): Promise<string> {
    const driver = await this.drivers.findByUserId(user.id);
    if (!driver) {
      throw new ForbiddenException('Tài khoản chưa được gắn với tài xế');
    }
    return driver.id;
  }

  async routesToday(user: AuthUser) {
    const driverId = await this.driverIdFor(user);
    return this.plans.driverRoutesToday(driverId);
  }

  async routeDetail(user: AuthUser, id: string) {
    await this.driverIdFor(user);
    return this.plans.findOne(id);
  }

  private async updateStop(
    stopId: string,
    status: RouteStopStatus,
    requestStatus: RequestStatus | null,
    note?: string,
  ) {
    const stop = await this.plans.getStop(stopId);
    if (!stop) throw new NotFoundException('Không tìm thấy điểm dừng');
    stop.status = status;
    if (note) stop.note = note;
    if (status === RouteStopStatus.ARRIVED) {
      stop.actual_arrival_time = new Date();
    } else {
      stop.actual_departure_time = new Date();
    }
    await this.plans.saveStop(stop);
    if (requestStatus && stop.request_id) {
      await this.requests.setStatus([stop.request_id], requestStatus);
    }
    await this.plans.maybeCompletePlan(stop.route_plan_id);
    return stop;
  }

  arrived(_user: AuthUser, stopId: string) {
    return this.updateStop(stopId, RouteStopStatus.ARRIVED, null);
  }

  async pickupCompleted(_user: AuthUser, stopId: string, note?: string) {
    return this.updateStop(
      stopId,
      RouteStopStatus.PICKUP_COMPLETED,
      RequestStatus.PICKUP_COMPLETED,
      note,
    );
  }

  async deliveryCompleted(_user: AuthUser, stopId: string, note?: string) {
    const stop = await this.plans.getStop(stopId);
    if (!stop) throw new NotFoundException('Không tìm thấy điểm dừng');
    const status =
      stop.point_type === PointType.PICKUP
        ? RequestStatus.PICKUP_COMPLETED
        : RequestStatus.DELIVERY_COMPLETED;
    return this.updateStop(
      stopId,
      stop.point_type === PointType.PICKUP
        ? RouteStopStatus.PICKUP_COMPLETED
        : RouteStopStatus.DELIVERY_COMPLETED,
      status,
      note,
    );
  }

  async failed(_user: AuthUser, stopId: string, note?: string) {
    if (!note) {
      throw new BadRequestException('Phải ghi chú lý do thất bại');
    }
    return this.updateStop(
      stopId,
      RouteStopStatus.FAILED,
      RequestStatus.FAILED,
      note,
    );
  }
}
