import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller({ path: 'activity', version: '1' })
@UseGuards(AuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists recent tenant activity events.' })
  listActivity(@CurrentAuth() auth: AuthContext, @Query('organizationId') organizationId?: string) {
    return this.activityService.list(auth, organizationId);
  }
}
