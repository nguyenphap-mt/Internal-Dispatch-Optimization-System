import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators';
import { Permission } from '../common/permissions';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions(Permission.REPORT_VIEW)
  dashboard(@Query('date') date?: string) {
    return this.reports.dashboard(date);
  }
}
