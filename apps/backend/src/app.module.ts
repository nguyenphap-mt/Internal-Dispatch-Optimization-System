import { Module, OnModuleInit } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { buildDataSourceOptions } from './config/data-source-options';
import { DispatchRequestsModule } from './dispatch-requests/dispatch-requests.module';
import { DriversModule } from './drivers/drivers.module';
import { OptimizationModule } from './optimization/optimization.module';
import { ReportsModule } from './reports/reports.module';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';
import { RoutePlansModule } from './route-plans/route-plans.module';
import { RouteStopsModule } from './route-stops/route-stops.module';
import { RoutingModule } from './routing/routing.module';
import { SettingsModule } from './settings/settings.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(buildDataSourceOptions()),
    AuthModule,
    RolesModule,
    UsersModule,
    VehiclesModule,
    DriversModule,
    DispatchRequestsModule,
    RoutePlansModule,
    RouteStopsModule,
    OptimizationModule,
    RoutingModule,
    SettingsModule,
    ReportsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly roles: RolesService) {}

  // Ensure the six PRD roles exist so logins resolve permissions on a fresh DB.
  async onModuleInit() {
    await this.roles.ensureDefaults();
  }
}
