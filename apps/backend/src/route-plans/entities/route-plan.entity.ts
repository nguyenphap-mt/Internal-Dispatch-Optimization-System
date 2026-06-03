import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoutePlanStatus } from '../../common/enums';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { RouteStop } from '../../route-stops/entities/route-stop.entity';

@Entity('route_plans')
export class RoutePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  route_code: string;

  @Column({ type: 'uuid', nullable: true })
  vehicle_id: string;

  @ManyToOne(() => Vehicle, { eager: true, nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'uuid', nullable: true })
  driver_id: string;

  @ManyToOne(() => Driver, { eager: true, nullable: true })
  @JoinColumn({ name: 'driver_id' })
  driver: Driver;

  @Column({ type: 'varchar', default: RoutePlanStatus.DRAFT })
  status: RoutePlanStatus;

  @Column({ type: 'timestamptz', nullable: true })
  departure_time: Date;

  @Column({ type: 'numeric', default: 0 })
  estimated_distance_km: number;

  @Column({ type: 'numeric', default: 0 })
  estimated_duration_minutes: number;

  @Column({ type: 'numeric', default: 0 })
  estimated_cost: number;

  @Column({ type: 'uuid', nullable: true })
  optimization_run_id: string;

  @Column({ type: 'jsonb', nullable: true })
  warnings: string[];

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamptz', nullable: true })
  approved_at: Date;

  @OneToMany(() => RouteStop, (s) => s.route_plan, { cascade: true, eager: true })
  stops: RouteStop[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
