import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PointType, Priority, RequestType } from '../common/enums';

export class DispatchPointDto {
  @ApiProperty({ enum: PointType })
  @IsEnum(PointType)
  point_type: PointType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional({ description: 'ISO datetime' })
  @IsOptional()
  @IsString()
  time_window_start?: string;

  @ApiPropertyOptional({ description: 'ISO datetime' })
  @IsOptional()
  @IsString()
  time_window_end?: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  service_time_minutes?: number;
}

export class CreateDispatchRequestDto {
  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  request_type: RequestType;

  @ApiProperty({ enum: Priority })
  @IsEnum(Priority)
  priority: Priority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cargo_type?: string;

  @ApiProperty()
  @IsNumber()
  weight_kg: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  volume_m3?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_bulky?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cargo_value?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  fragile?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_vip?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  inner_city?: boolean;

  @ApiPropertyOptional({ description: 'Khu vực/quận để gom chuyến' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ type: [DispatchPointDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DispatchPointDto)
  points: DispatchPointDto[];
}

export class UpdateDispatchRequestDto extends PartialType(
  CreateDispatchRequestDto,
) {}

export class CancelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
