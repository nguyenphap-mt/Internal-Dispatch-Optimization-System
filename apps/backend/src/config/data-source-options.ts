import { DataSourceOptions } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { DispatchRequest } from '../dispatch-requests/entities/dispatch-request.entity';
import { DispatchPoint } from '../dispatch-points/entities/dispatch-point.entity';
import { RoutePlan } from '../route-plans/entities/route-plan.entity';
import { RouteStop } from '../route-stops/entities/route-stop.entity';
import { OptimizationRun } from '../optimization/entities/optimization-run.entity';
import { DispatcherOverride } from '../route-plans/entities/dispatcher-override.entity';
import { SystemSetting } from '../settings/entities/system-setting.entity';

export const entities = [
  Role,
  User,
  Vehicle,
  Driver,
  DispatchRequest,
  DispatchPoint,
  RoutePlan,
  RouteStop,
  OptimizationRun,
  DispatcherOverride,
  SystemSetting,
];

export function buildDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'dispatch',
    password: process.env.DB_PASSWORD ?? 'dispatch',
    database: process.env.DB_NAME ?? 'dispatch',
    entities,
    // Dev convenience: auto-sync schema unless explicitly disabled.
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
    logging: (process.env.DB_LOGGING ?? 'false') === 'true',
  };
}
