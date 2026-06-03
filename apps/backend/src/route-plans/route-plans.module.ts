import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispatchRequestsModule } from '../dispatch-requests/dispatch-requests.module';
import { RouteStop } from '../route-stops/entities/route-stop.entity';
import { DispatcherOverride } from './entities/dispatcher-override.entity';
import { RoutePlan } from './entities/route-plan.entity';
import { RoutePlansController } from './route-plans.controller';
import { RoutePlansService } from './route-plans.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoutePlan, RouteStop, DispatcherOverride]),
    DispatchRequestsModule,
  ],
  controllers: [RoutePlansController],
  providers: [RoutePlansService],
  exports: [RoutePlansService],
})
export class RoutePlansModule {}
