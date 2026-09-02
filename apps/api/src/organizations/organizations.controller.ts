import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { AuthContext } from '../auth/auth.types';
import { CreateInvitationDto, UpdateOrganizationDto } from './organizations.dto';
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
  getOrganization(
    @CurrentAuth() auth: AuthContext,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationsService.getById(auth, organizationId);
  }

  @Patch(':organizationId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Updates organization profile and settings.' })
  updateOrganization(
    @CurrentAuth() auth: AuthContext,
    @Param('organizationId') organizationId: string,
    @Body() body: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(auth, organizationId, body);
  }

  @Get(':organizationId/members')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Lists active members for the organization.' })
  listMembers(@CurrentAuth() auth: AuthContext, @Param('organizationId') organizationId: string) {
    return this.organizationsService.listMembers(auth, organizationId);
  }

  @Get(':organizationId/invitations')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Lists pending invitations for the organization.' })
  listInvitations(
    @CurrentAuth() auth: AuthContext,
    @Param('organizationId') organizationId: string,
  ) {
    return this.organizationsService.listInvitations(auth, organizationId);
  }

  @Post(':organizationId/invitations')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Creates a pending team invitation.' })
  createInvitation(
    @CurrentAuth() auth: AuthContext,
    @Param('organizationId') organizationId: string,
    @Body() body: CreateInvitationDto,
  ) {
    return this.organizationsService.createInvitation(auth, organizationId, body);
  }

  @Delete(':organizationId/invitations/:invitationId')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ description: 'Cancels a pending team invitation.' })
  cancelInvitation(
    @CurrentAuth() auth: AuthContext,
    @Param('organizationId') organizationId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.organizationsService.cancelInvitation(auth, organizationId, invitationId);
  }
}
