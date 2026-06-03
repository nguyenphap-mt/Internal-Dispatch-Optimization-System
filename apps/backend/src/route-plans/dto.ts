import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AssignRouteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vehicle_id?: string;

  @ApiProperty()
  @IsUUID()
  driver_id: string;
}

export class CancelRouteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class StopOrderItem {
  @ApiProperty()
  @IsUUID()
  stop_id: string;

  @ApiProperty()
  @IsNumber()
  stop_sequence: number;
}

export class ReorderStopsDto {
  @ApiProperty({ type: [StopOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopOrderItem)
  stops: StopOrderItem[];

  @ApiProperty({ description: 'Lý do chỉnh tuyến (bắt buộc - BR-DIS-003)' })
  @IsString()
  reason: string;
}
