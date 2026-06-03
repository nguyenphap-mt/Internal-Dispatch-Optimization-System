import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RequestIdsDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'Để trống = lấy tất cả yêu cầu đang chờ điều phối',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  request_ids?: string[];
}

export class RouteCostDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('all', { each: true })
  request_ids: string[];

  @ApiProperty()
  @IsUUID()
  vehicle_id: string;
}

export class UpdateRoutingConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  urgent_threshold_minutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  motorbike_max_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  truck_max_weight_kg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  late_penalty_per_minute?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  empty_run_penalty?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  default_driver_cost_per_minute?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  fallback_speed_kmh?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  default_depot_lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  default_depot_lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
