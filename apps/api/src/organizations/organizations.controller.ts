import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@Controller({ path: 'organizations', version: '1' })
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('status')
  @ApiOkResponse({ description: 'Organizations module readiness.' })
  getStatus() {
    return this.organizationsService.getStatus();
  }
}
