import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators';
import { Permission } from '../common/permissions';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('vehicles')
@ApiBearerAuth()
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    return this.vehicles.findAll(active === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehicles.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.VEHICLE_MANAGE)
  create(@Body() dto: CreateVehicleDto) {
    return this.vehicles.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.VEHICLE_MANAGE)
  update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.VEHICLE_MANAGE)
  deactivate(@Param('id') id: string) {
    return this.vehicles.deactivate(id);
  }
}
