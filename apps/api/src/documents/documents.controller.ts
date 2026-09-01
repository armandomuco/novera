import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { CreateDocumentDto } from './documents.dto';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@Controller({ path: 'documents', version: '1' })
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists tenant-scoped document metadata.' })
  listDocuments(@CurrentAuth() auth: AuthContext, @Query('organizationId') organizationId?: string) {
    return this.documentsService.list(auth, organizationId);
  }

  @Post()
  @ApiOkResponse({ description: 'Creates tenant-scoped document metadata.' })
  createDocument(@CurrentAuth() auth: AuthContext, @Body() body: CreateDocumentDto) {
    return this.documentsService.create(auth, body);
  }
}
