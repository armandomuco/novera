import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { CreateKnowledgeItemDto, UpdateKnowledgeItemDto } from './knowledge.dto';
import { KnowledgeService } from './knowledge.service';

@ApiTags('knowledge')
@Controller({ path: 'knowledge-items', version: '1' })
@UseGuards(AuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists tenant-scoped knowledge items.' })
  listKnowledgeItems(
    @CurrentAuth() auth: AuthContext,
    @Query('organizationId') organizationId?: string,
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
  ) {
    return this.knowledgeService.list(auth, { organizationId, projectId, type });
  }

  @Post()
  @ApiOkResponse({ description: 'Creates a tenant-scoped knowledge item.' })
  createKnowledgeItem(@CurrentAuth() auth: AuthContext, @Body() body: CreateKnowledgeItemDto) {
    return this.knowledgeService.create(auth, body);
  }

  @Get(':itemId')
  @ApiOkResponse({ description: 'Gets a knowledge item after tenant validation.' })
  getKnowledgeItem(@CurrentAuth() auth: AuthContext, @Param('itemId') itemId: string) {
    return this.knowledgeService.get(auth, itemId);
  }

  @Patch(':itemId')
  @ApiOkResponse({ description: 'Updates a knowledge item after tenant and role validation.' })
  updateKnowledgeItem(
    @CurrentAuth() auth: AuthContext,
    @Param('itemId') itemId: string,
    @Body() body: UpdateKnowledgeItemDto,
  ) {
    return this.knowledgeService.update(auth, itemId, body);
  }

  @Delete(':itemId')
  @ApiOkResponse({ description: 'Archives a knowledge item using soft deletion.' })
  archiveKnowledgeItem(@CurrentAuth() auth: AuthContext, @Param('itemId') itemId: string) {
    return this.knowledgeService.archive(auth, itemId);
  }
}
