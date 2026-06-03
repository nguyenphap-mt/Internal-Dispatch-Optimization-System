import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ select: false })
  password_hash: string;

  @Column({ type: 'uuid', nullable: true })
  role_id: string;

  @ManyToOne(() => Role, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ nullable: true })
  department: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
