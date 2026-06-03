import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, RequirePermissions } from '../common/decorators';
import { RoutePlanStatus } from '../common/enums';
import { Permission } from '../common/permissions';
import { AssignRouteDto, CancelRouteDto, ReorderStopsDto } from './dto';
import { RoutePlansService } from './route-plans.service';

@ApiTags('routes')
@ApiBearerAuth()
@Controller('routes')
export class RoutePlansController {
  constructor(private readonly service: RoutePlansService) {}

  @Get()
  findAll(@Query('status') status?: RoutePlanStatus) {
    return this.service.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/approve')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTE_APPROVE)
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.approve(id, user);
  }

  @Post(':id/assign')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTE_ASSIGN)
  assign(
    @Param('id') id: string,
    @Body() dto: AssignRouteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.assign(id, dto, user);
  }

  @Post(':id/reorder')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTE_EDIT)
  reorder(
    @Param('id') id: string,
    @Body() dto: ReorderStopsDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reorderStops(id, dto.stops, dto.reason, user);
  }

  @Post(':id/start')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTE_ASSIGN)
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Post(':id/complete')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTE_APPROVE)
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @RequirePermissions(Permission.ROUTE_CANCEL)
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelRouteDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.cancel(id, user, dto.reason);
  }
}
