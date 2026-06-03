import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Permission } from '../../common/permissions';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions: Permission[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
