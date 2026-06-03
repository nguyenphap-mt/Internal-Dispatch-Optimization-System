import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators';
import { Permission } from '../common/permissions';
import { CreateDriverDto, UpdateDriverDto } from './dto';
import { DriversService } from './drivers.service';

@ApiTags('drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly drivers: DriversService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    return this.drivers.findAll(active === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drivers.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.DRIVER_MANAGE)
  create(@Body() dto: CreateDriverDto) {
    return this.drivers.create(dto);
  }

  @Put(':id')
  @RequirePermissions(Permission.DRIVER_MANAGE)
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.drivers.update(id, dto);
  }
}
