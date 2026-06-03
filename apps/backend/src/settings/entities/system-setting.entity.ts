import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: unknown;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
