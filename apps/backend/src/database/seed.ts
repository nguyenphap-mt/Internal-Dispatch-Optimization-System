import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import {
  OperatingArea,
  PointType,
  Priority,
  RequestStatus,
  RequestType,
  RoleCode,
  VehicleType,
} from '../common/enums';
import { ROLE_PERMISSIONS } from '../common/permissions';
import { buildDataSourceOptions } from '../config/data-source-options';
import { DEFAULT_ROUTING_CONFIG } from '../routing/engine/config';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { DispatchRequest } from '../dispatch-requests/entities/dispatch-request.entity';
import { DispatchPoint } from '../dispatch-points/entities/dispatch-point.entity';
import { SystemSetting } from '../settings/entities/system-setting.entity';

const PASSWORD = 'password123';

// Hanoi depot.
const DEPOT = { lat: 21.0278, lng: 105.8342 };

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 3600 * 1000);
}

async function run() {
  const ds = new DataSource(buildDataSourceOptions());
  await ds.initialize();
  // Ensure schema exists when running standalone.
  await ds.synchronize();

  const roleRepo = ds.getRepository(Role);
  const userRepo = ds.getRepository(User);
  const vehicleRepo = ds.getRepository(Vehicle);
  const driverRepo = ds.getRepository(Driver);
  const requestRepo = ds.getRepository(DispatchRequest);
  const settingRepo = ds.getRepository(SystemSetting);

  // Roles
  const roles: Record<string, Role> = {};
  for (const code of Object.values(RoleCode)) {
    let role = await roleRepo.findOne({ where: { code } });
    if (!role) {
      role = await roleRepo.save(
        roleRepo.create({ code, name: code, permissions: ROLE_PERMISSIONS[code] }),
      );
    } else {
      role.permissions = ROLE_PERMISSIONS[code];
      await roleRepo.save(role);
    }
    roles[code] = role;
  }

  // Users
  const password_hash = await bcrypt.hash(PASSWORD, 10);
  const userSpecs = [
    { full_name: 'Quản trị viên', email: 'admin@dispatch.local', role: RoleCode.ADMIN, department: 'IT' },
    { full_name: 'Nhân viên Sales', email: 'sales@dispatch.local', role: RoleCode.SALES, department: 'Sales' },
    { full_name: 'Nhân viên Mua hàng', email: 'purchasing@dispatch.local', role: RoleCode.PURCHASING, department: 'Purchasing' },
    { full_name: 'Điều phối viên', email: 'dispatcher@dispatch.local', role: RoleCode.DISPATCHER, department: 'Logistics' },
    { full_name: 'Quản lý', email: 'manager@dispatch.local', role: RoleCode.MANAGER, department: 'Logistics' },
    { full_name: 'Tài xế A', email: 'driver@dispatch.local', role: RoleCode.DRIVER, department: 'Logistics' },
  ];
  const users: Record<string, User> = {};
  for (const spec of userSpecs) {
    let user = await userRepo.findOne({ where: { email: spec.email } });
    if (!user) {
      user = await userRepo.save(
        userRepo.create({
          full_name: spec.full_name,
          email: spec.email,
          password_hash,
          role_id: roles[spec.role].id,
          department: spec.department,
          active: true,
        }),
      );
    }
    users[spec.role] = user;
  }

  // Vehicles
  const vehicleSpecs = [
    {
      vehicle_code: 'MB-01',
      vehicle_type: VehicleType.MOTORBIKE,
      vehicle_name: 'Xe máy giao nhanh 1',
      max_weight_kg: 50,
      max_volume_m3: 0.5,
      operating_area: OperatingArea.INNER_CITY,
      fuel_cost_per_km: 1000,
      fixed_trip_cost: 0,
    },
    {
      vehicle_code: 'MB-02',
      vehicle_type: VehicleType.MOTORBIKE,
      vehicle_name: 'Xe máy giao nhanh 2',
      max_weight_kg: 50,
      max_volume_m3: 0.5,
      operating_area: OperatingArea.INNER_CITY,
      fuel_cost_per_km: 1000,
      fixed_trip_cost: 0,
    },
    {
      vehicle_code: 'TR-01',
      vehicle_type: VehicleType.TRUCK,
      vehicle_name: 'Xe tải 1 tấn',
      max_weight_kg: 1000,
      max_volume_m3: 6,
      operating_area: OperatingArea.BOTH,
      fuel_cost_per_km: 5000,
      fixed_trip_cost: 50000,
    },
  ];
  const vehicles: Vehicle[] = [];
  for (const spec of vehicleSpecs) {
    let v = await vehicleRepo.findOne({ where: { vehicle_code: spec.vehicle_code } });
    if (!v) v = await vehicleRepo.save(vehicleRepo.create(spec));
    vehicles.push(v);
  }

  // Driver linked to driver user
  let driver = await driverRepo.findOne({ where: { user_id: users[RoleCode.DRIVER].id } });
  if (!driver) {
    driver = await driverRepo.save(
      driverRepo.create({
        user_id: users[RoleCode.DRIVER].id,
        full_name: 'Tài xế A',
        phone: '0900000001',
        default_vehicle_id: vehicles[0].id,
        license_type: 'A1',
        active: true,
      }),
    );
  }

  // Settings: routing config + depot
  await upsertSetting(settingRepo, 'routing_config', DEFAULT_ROUTING_CONFIG, 'Routing engine configuration');
  await upsertSetting(settingRepo, 'depot', DEPOT, 'Kho/điểm xuất phát mặc định');

  // Sample requests (waiting for dispatch) if none exist yet.
  const existing = await requestRepo.count();
  if (existing === 0) {
    const sales = users[RoleCode.SALES];
    const samples = [
      {
        code: 'YC000001',
        area: 'Hoàn Kiếm',
        weight: 8,
        lat: 21.0285,
        lng: 105.8542,
        name: 'Khách Hoàn Kiếm',
      },
      {
        code: 'YC000002',
        area: 'Hoàn Kiếm',
        weight: 12,
        lat: 21.031,
        lng: 105.851,
        name: 'Khách Hàng Bài',
      },
      {
        code: 'YC000003',
        area: 'Hoàn Kiếm',
        weight: 6,
        lat: 21.025,
        lng: 105.857,
        name: 'Khách Lý Thường Kiệt',
      },
      {
        code: 'YC000004',
        area: 'Cầu Giấy',
        weight: 300,
        lat: 21.0305,
        lng: 105.7967,
        name: 'Kho Cầu Giấy (hàng nặng)',
      },
    ];
    let seq = 1;
    for (const s of samples) {
      const req = requestRepo.create({
        request_code: `YC${String(seq++).padStart(6, '0')}`,
        request_type: RequestType.DELIVERY,
        priority: s.weight > 100 ? Priority.SAME_DAY : Priority.FLEXIBLE,
        status: RequestStatus.WAITING_DISPATCH,
        created_by: sales.id,
        department: 'Sales',
        cargo_type: 'Hàng tiêu dùng',
        weight_kg: s.weight,
        volume_m3: 0.1,
        inner_city: s.area !== 'Cầu Giấy',
        area: s.area,
        points: [
          Object.assign(new DispatchPoint(), {
            point_type: PointType.PICKUP,
            location_name: 'Kho trung tâm',
            address: 'Số 1 Đại Cồ Việt, Hà Nội',
            lat: DEPOT.lat,
            lng: DEPOT.lng,
            contact_name: 'Thủ kho',
            contact_phone: '0900000000',
            time_window_start: hoursFromNow(0.5),
            time_window_end: hoursFromNow(8),
            service_time_minutes: 10,
          }),
          Object.assign(new DispatchPoint(), {
            point_type: PointType.DELIVERY,
            location_name: s.name,
            address: `${s.area}, Hà Nội`,
            lat: s.lat,
            lng: s.lng,
            contact_name: s.name,
            contact_phone: '0911111111',
            time_window_start: hoursFromNow(1),
            time_window_end: hoursFromNow(6),
            service_time_minutes: 10,
          }),
        ],
      });
      await requestRepo.save(req);
    }
  }

  // eslint-disable-next-line no-console
  console.log('Seed hoàn tất. Tài khoản mẫu (mật khẩu: %s):', PASSWORD);
  for (const spec of userSpecs) {
    // eslint-disable-next-line no-console
    console.log(`  - ${spec.role.padEnd(11)} ${spec.email}`);
  }
  await ds.destroy();
}

async function upsertSetting(
  repo: ReturnType<DataSource['getRepository']>,
  key: string,
  value: unknown,
  description: string,
) {
  const existing = await repo.findOne({ where: { key } });
  if (existing) {
    (existing as SystemSetting).value = value;
    await repo.save(existing);
  } else {
    await repo.save(repo.create({ key, value, description } as Partial<SystemSetting>));
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed lỗi:', err);
  process.exit(1);
});
