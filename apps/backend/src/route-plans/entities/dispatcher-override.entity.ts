import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('dispatcher_overrides')
export class DispatcherOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  route_plan_id: string;

  @Column({ type: 'uuid', nullable: true })
  changed_by: string;

  @Column()
  change_type: string;

  @Column({ type: 'jsonb', nullable: true })
  old_value: unknown;

  @Column({ type: 'jsonb', nullable: true })
  new_value: unknown;

  @Column({ type: 'text' })
  reason: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
