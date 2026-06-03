import { Module } from '@nestjs/common';
import { DispatchRequestsModule } from '../dispatch-requests/dispatch-requests.module';
import { OptimizationModule } from '../optimization/optimization.module';
import { RoutePlansModule } from '../route-plans/route-plans.module';
import { SettingsModule } from '../settings/settings.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { OsrmService } from './osrm.service';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';

@Module({
  imports: [
    DispatchRequestsModule,
    VehiclesModule,
    SettingsModule,
    OptimizationModule,
    RoutePlansModule,
  ],
  controllers: [RoutingController],
  providers: [RoutingService, OsrmService],
  exports: [RoutingService],
})
export class RoutingModule {}
