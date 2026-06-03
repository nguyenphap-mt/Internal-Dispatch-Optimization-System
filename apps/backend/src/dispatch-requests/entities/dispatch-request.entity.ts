import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Classification,
  Priority,
  RequestStatus,
  RequestType,
} from '../../common/enums';
import { DispatchPoint } from '../../dispatch-points/entities/dispatch-point.entity';

@Entity('dispatch_requests')
export class DispatchRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  request_code: string;

  @Column({ type: 'varchar' })
  request_type: RequestType;

  @Column({ type: 'varchar' })
  priority: Priority;

  @Column({ type: 'varchar', default: RequestStatus.DRAFT })
  status: RequestStatus;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  cargo_type: string;

  @Column({ type: 'numeric', default: 0 })
  weight_kg: number;

  @Column({ type: 'numeric', default: 0 })
  volume_m3: number;

  @Column({ default: false })
  is_bulky: boolean;

  @Column({ type: 'numeric', nullable: true })
  cargo_value: number;

  @Column({ default: false })
  fragile: boolean;

  @Column({ default: false })
  is_vip: boolean;

  @Column({ default: true })
  inner_city: boolean;

  @Column({ nullable: true })
  area: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'numeric', default: 0 })
  score: number;

  @Column({ type: 'varchar', nullable: true })
  classification: Classification;

  @OneToMany(() => DispatchPoint, (p) => p.request, { cascade: true, eager: true })
  points: DispatchPoint[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
