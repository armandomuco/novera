import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { AuthContext } from '../auth/auth.types';
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

  @Get()
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Lists organizations where the authenticated user is a member.' })
  listOrganizations(@CurrentAuth() auth: AuthContext) {
    return this.organizationsService.listForUser(auth);
  }

  @Get(':organizationId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Returns one organization after membership validation.' })
  getOrganization(@CurrentAuth() auth: AuthContext, @Param('organizationId') organizationId: string) {
    return this.organizationsService.getById(auth, organizationId);
  }
}
