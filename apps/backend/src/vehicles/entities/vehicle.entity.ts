import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OperatingArea, VehicleType } from '../../common/enums';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  vehicle_code: string;

  @Column({ type: 'varchar' })
  vehicle_type: VehicleType;

  @Column()
  vehicle_name: string;

  @Column({ type: 'numeric' })
  max_weight_kg: number;

  @Column({ type: 'numeric', default: 0 })
  max_volume_m3: number;

  @Column({ type: 'varchar', default: OperatingArea.BOTH })
  operating_area: OperatingArea;

  @Column({ type: 'numeric' })
  fuel_cost_per_km: number;

  @Column({ type: 'numeric', default: 0 })
  fixed_trip_cost: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
