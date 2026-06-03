import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators';
import { Permission } from '../common/permissions';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  list() {
    return this.settings.list();
  }

  @Put(':key')
  @RequirePermissions(Permission.SETTINGS_MANAGE)
  set(@Param('key') key: string, @Body() body: { value: unknown; description?: string }) {
    return this.settings.setValue(key, body.value, body.description);
  }
}
