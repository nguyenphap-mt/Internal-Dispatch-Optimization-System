import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchRequest } from '../dispatch-requests/entities/dispatch-request.entity';
import { RoutePlan } from '../route-plans/entities/route-plan.entity';
import { RouteStop } from '../route-stops/entities/route-stop.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [TypeOrmModule.forFeature([DispatchRequest, RoutePlan, RouteStop])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
