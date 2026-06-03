import { Body, Controller, Get, HttpCode, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, RequirePermissions } from '../common/decorators';
import { Permission } from '../common/permissions';
import { RequestIdsDto, RouteCostDto, UpdateRoutingConfigDto } from './dto';
import { RoutingService } from './routing.service';

@ApiTags('routing')
@ApiBearerAuth()
@Controller('routing')
export class RoutingController {
  constructor(private readonly routing: RoutingService) {}

  @Post('score-requests')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  score(@Body() dto: RequestIdsDto) {
    return this.routing.scoreRequestsOnly(dto.request_ids);
  }

  @Post('classify-requests')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  classify(@Body() dto: RequestIdsDto) {
    return this.routing.classifyRequests(dto.request_ids);
  }

  @Post('vehicle-match')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  vehicleMatch(@Body() dto: RequestIdsDto) {
    return this.routing.vehicleMatch(dto.request_ids);
  }

  @Post('preview')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  preview(@Body() dto: RequestIdsDto) {
    return this.routing.preview(dto.request_ids);
  }

  @Post('optimize')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  optimize(@Body() dto: RequestIdsDto, @CurrentUser() user: AuthUser) {
    return this.routing.optimize(user, dto.request_ids);
  }

  @Post('recalculate')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  recalculate(@Body() dto: RequestIdsDto, @CurrentUser() user: AuthUser) {
    return this.routing.recalculate(user, dto.request_ids);
  }

  @Post('route-cost')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTING_RUN)
  routeCost(@Body() dto: RouteCostDto) {
    return this.routing.routeCost(dto.request_ids, dto.vehicle_id);
  }

  @Get('config')
  @RequirePermissions(Permission.ROUTING_RUN)
  getConfig() {
    return this.routing.getConfig();
  }

  @Put('config')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  updateConfig(@Body() dto: UpdateRoutingConfigDto) {
    return this.routing.updateConfig(dto);
  }
}
