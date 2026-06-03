import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { AuthUser, CurrentUser, RequirePermissions } from '../common/decorators';
import { Permission } from '../common/permissions';
import { DriverService } from './driver.service';

class StopNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

@ApiTags('driver')
@ApiBearerAuth()
@Controller('driver')
export class DriverController {
  constructor(private readonly driver: DriverService) {}

  @Get('routes/today')
  @RequirePermissions(Permission.DRIVER_VIEW_OWN_ROUTES)
  today(@CurrentUser() user: AuthUser) {
    return this.driver.routesToday(user);
  }

  @Get('routes/:id')
  @RequirePermissions(Permission.DRIVER_VIEW_OWN_ROUTES)
  detail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.driver.routeDetail(user, id);
  }

  @Post('stops/:id/arrived')
  @HttpCode(200)
  @RequirePermissions(Permission.DRIVER_UPDATE_STATUS)
  arrived(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.driver.arrived(user, id);
  }

  @Post('stops/:id/pickup-completed')
  @HttpCode(200)
  @RequirePermissions(Permission.DRIVER_UPDATE_STATUS)
  pickup(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: StopNoteDto,
  ) {
    return this.driver.pickupCompleted(user, id, dto.note);
  }

  @Post('stops/:id/delivery-completed')
  @HttpCode(200)
  @RequirePermissions(Permission.DRIVER_UPDATE_STATUS)
  delivery(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: StopNoteDto,
  ) {
    return this.driver.deliveryCompleted(user, id, dto.note);
  }

  @Post('stops/:id/failed')
  @HttpCode(200)
  @RequirePermissions(Permission.DRIVER_UPDATE_STATUS)
  failed(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: StopNoteDto,
  ) {
    return this.driver.failed(user, id, dto.note);
  }
}
