import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { RequestStatus, RoutePlanStatus } from '../common/enums';
import { DispatchRequest } from '../dispatch-requests/entities/dispatch-request.entity';
import { RoutePlan } from '../route-plans/entities/route-plan.entity';
import { RouteStop } from '../route-stops/entities/route-stop.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(DispatchRequest)
    private readonly requests: Repository<DispatchRequest>,
    @InjectRepository(RoutePlan)
    private readonly plans: Repository<RoutePlan>,
    @InjectRepository(RouteStop)
    private readonly stops: Repository<RouteStop>,
  ) {}

  private dayRange(date?: string): [Date, Date] {
    const base = date ? new Date(date) : new Date();
    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    const end = new Date(base);
    end.setHours(23, 59, 59, 999);
    return [start, end];
  }

  // Dashboard summary for managers/dispatchers (PRD section 20.5).
  async dashboard(date?: string) {
    const [start, end] = this.dayRange(date);

    const requests = await this.requests.find({
      where: { created_at: Between(start, end) },
    });
    const plans = await this.plans.find({
      where: { created_at: Between(start, end) },
    });

    const byStatus: Record<string, number> = {};
    for (const r of requests) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    }
    const byClassification: Record<string, number> = {};
    for (const r of requests) {
      const c = r.classification ?? 'Unscored';
      byClassification[c] = (byClassification[c] ?? 0) + 1;
    }

    const totalDistanceKm = plans.reduce(
      (s, p) => s + (Number(p.estimated_distance_km) || 0),
      0,
    );
    const totalCost = plans.reduce(
      (s, p) => s + (Number(p.estimated_cost) || 0),
      0,
    );

    // On-time rate: completed stops whose actual arrival <= planned arrival.
    const planIds = plans.map((p) => p.id);
    let onTimeRate = 1;
    let completedStops = 0;
    let onTimeStops = 0;
    if (planIds.length > 0) {
      const stops = await this.stops.find();
      const relevant = stops.filter(
        (s) =>
          planIds.includes(s.route_plan_id) &&
          s.actual_arrival_time != null,
      );
      completedStops = relevant.length;
      onTimeStops = relevant.filter(
        (s) =>
          s.planned_arrival_time &&
          new Date(s.actual_arrival_time).getTime() <=
            new Date(s.planned_arrival_time).getTime(),
      ).length;
      onTimeRate = completedStops > 0 ? onTimeStops / completedStops : 1;
    }

    return {
      date: start.toISOString().slice(0, 10),
      requests: {
        total: requests.length,
        by_status: byStatus,
        by_classification: byClassification,
        completed:
          (byStatus[RequestStatus.COMPLETED] ?? 0) +
          (byStatus[RequestStatus.DELIVERY_COMPLETED] ?? 0),
      },
      routes: {
        total: plans.length,
        completed: plans.filter((p) => p.status === RoutePlanStatus.COMPLETED)
          .length,
        total_distance_km: Math.round(totalDistanceKm * 100) / 100,
        total_cost: Math.round(totalCost),
      },
      on_time: {
        rate: Math.round(onTimeRate * 1000) / 1000,
        completed_stops: completedStops,
        on_time_stops: onTimeStops,
      },
    };
  }
}
