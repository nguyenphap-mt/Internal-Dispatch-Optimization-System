import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RouteStopStatus, PointType } from '../../common/enums';
import { RoutePlan } from '../../route-plans/entities/route-plan.entity';

@Entity('route_stops')
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  route_plan_id: string;

  @ManyToOne(() => RoutePlan, (r) => r.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_plan_id' })
  route_plan: RoutePlan;

  @Column({ type: 'uuid', nullable: true })
  request_id: string;

  @Column({ type: 'uuid', nullable: true })
  dispatch_point_id: string;

  @Column({ type: 'varchar', default: PointType.DELIVERY })
  point_type: PointType;

  @Column({ nullable: true })
  location_name: string;

  @Column({ type: 'numeric', nullable: true })
  lat: number;

  @Column({ type: 'numeric', nullable: true })
  lng: number;

  @Column({ type: 'integer' })
  stop_sequence: number;

  @Column({ type: 'timestamptz', nullable: true })
  planned_arrival_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actual_arrival_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  planned_departure_time: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actual_departure_time: Date;

  @Column({ type: 'varchar', default: RouteStopStatus.PENDING })
  status: RouteStopStatus;

  @Column({ type: 'text', nullable: true })
  note: string;
}
