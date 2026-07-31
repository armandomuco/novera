import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller({ path: 'projects', version: '1' })
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists projects for the active or requested organization.' })
  listProjects(@CurrentAuth() auth: AuthContext, @Query('organizationId') organizationId?: string) {
    return this.projectsService.list(auth, organizationId);
  }

  @Post()
  @ApiOkResponse({ description: 'Creates a tenant-scoped project.' })
  createProject(@CurrentAuth() auth: AuthContext, @Body() body: CreateProjectDto) {
    return this.projectsService.create(auth, body);
  }

  @Get(':projectId')
  @ApiOkResponse({ description: 'Gets a project after tenant membership validation.' })
  getProject(@CurrentAuth() auth: AuthContext, @Param('projectId') projectId: string) {
    return this.projectsService.get(auth, projectId);
  }

  @Patch(':projectId')
  @ApiOkResponse({ description: 'Updates a project after role and tenant validation.' })
  updateProject(
    @CurrentAuth() auth: AuthContext,
    @Param('projectId') projectId: string,
    @Body() body: UpdateProjectDto,
  ) {
    return this.projectsService.update(auth, projectId, body);
  }

  @Delete(':projectId')
  @ApiOkResponse({ description: 'Archives a project using soft deletion.' })
  archiveProject(@CurrentAuth() auth: AuthContext, @Param('projectId') projectId: string) {
    return this.projectsService.archive(auth, projectId);
  }
}
