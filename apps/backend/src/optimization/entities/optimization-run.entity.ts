import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('optimization_runs')
export class OptimizationRun {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  run_code: string;

  @Column({ type: 'varchar', default: 'optimize' })
  run_type: string;

  @Column({ type: 'jsonb', nullable: true })
  input_snapshot: unknown;

  @Column({ type: 'jsonb', nullable: true })
  output_snapshot: unknown;

  @Column({ type: 'numeric', default: 0 })
  total_cost: number;

  @Column({ type: 'numeric', default: 0 })
  total_distance_km: number;

  @Column({ type: 'numeric', default: 0 })
  total_duration_minutes: number;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
