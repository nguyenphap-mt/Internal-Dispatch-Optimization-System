import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PointType } from '../../common/enums';
import { DispatchRequest } from '../../dispatch-requests/entities/dispatch-request.entity';

@Entity('dispatch_points')
export class DispatchPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  request_id: string;

  @ManyToOne(() => DispatchRequest, (r) => r.points, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'request_id' })
  request: DispatchRequest;

  @Column({ type: 'varchar' })
  point_type: PointType;

  @Column({ nullable: true })
  location_name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'numeric', nullable: true })
  lat: number;

  @Column({ type: 'numeric', nullable: true })
  lng: number;

  @Column({ nullable: true })
  contact_name: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ type: 'timestamptz', nullable: true })
  time_window_start: Date;

  @Column({ type: 'timestamptz', nullable: true })
  time_window_end: Date;

  @Column({ type: 'integer', default: 10 })
  service_time_minutes: number;

  @Column({ nullable: true })
  sequence_rule: string;
}
