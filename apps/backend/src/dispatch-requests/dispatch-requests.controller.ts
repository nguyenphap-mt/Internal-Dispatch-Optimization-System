import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser, RequirePermissions } from '../common/decorators';
import { RequestStatus } from '../common/enums';
import { Permission } from '../common/permissions';
import {
  CancelDto,
  CreateDispatchRequestDto,
  UpdateDispatchRequestDto,
} from './dto';
import { DispatchRequestsService } from './dispatch-requests.service';

@ApiTags('dispatch-requests')
@ApiBearerAuth()
@Controller('dispatch-requests')
export class DispatchRequestsController {
  constructor(private readonly service: DispatchRequestsService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: RequestStatus,
    @Query('priority') priority?: string,
    @Query('created_by') createdBy?: string,
  ) {
    return this.service.visibleFor(user, {
      status,
      priority,
      created_by: createdBy,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @RequirePermissions(Permission.REQUEST_CREATE)
  create(@Body() dto: CreateDispatchRequestDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDispatchRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user);
  }

  @Post(':id/submit')
  @HttpCode(200)
  submit(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.submit(id, user);
  }

  @Post(':id/cancel')
  @HttpCode(200)
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.cancel(id, user, dto.reason);
  }
}
