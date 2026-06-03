import { Module } from '@nestjs/common';
import { DispatchRequestsModule } from '../dispatch-requests/dispatch-requests.module';
import { DriversModule } from '../drivers/drivers.module';
import { RoutePlansModule } from '../route-plans/route-plans.module';
import { DriverController } from './driver.controller';
import { DriverService } from './driver.service';

@Module({
  imports: [DriversModule, RoutePlansModule, DispatchRequestsModule],
  controllers: [DriverController],
  providers: [DriverService],
})
export class RouteStopsModule {}
