import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty()
  @IsString()
  full_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  default_vehicle_id?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  license_type?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateDriverDto extends PartialType(CreateDriverDto) {}
