import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OperatingArea, VehicleType } from '../common/enums';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  vehicle_code: string;

  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicle_type: VehicleType;

  @ApiProperty()
  @IsString()
  vehicle_name: string;

  @ApiProperty()
  @IsNumber()
  max_weight_kg: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  max_volume_m3?: number;

  @ApiProperty({ enum: OperatingArea, required: false })
  @IsOptional()
  @IsEnum(OperatingArea)
  operating_area?: OperatingArea;

  @ApiProperty()
  @IsNumber()
  fuel_cost_per_km: number;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  fixed_trip_cost?: number;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateVehicleDto extends PartialType(CreateVehicleDto) {}
