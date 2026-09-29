import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthContext } from '../auth/auth.types';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { CreateDocumentDto, SearchDocumentsDto, UploadDocumentDto } from './documents.dto';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@Controller({ path: 'documents', version: '1' })
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lists tenant-scoped document metadata.' })
  listDocuments(
    @CurrentAuth() auth: AuthContext,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.documentsService.list(auth, organizationId);
  }

  @Post()
  @ApiOkResponse({ description: 'Creates tenant-scoped document metadata.' })
  createDocument(@CurrentAuth() auth: AuthContext, @Body() body: CreateDocumentDto) {
    return this.documentsService.create(auth, body);
  }

  @Get('search')
  @ApiOkResponse({ description: 'Searches authorized document chunks in the active tenant.' })
  searchDocuments(@CurrentAuth() auth: AuthContext, @Query() query: SearchDocumentsDto) {
    return this.documentsService.search(auth, query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Validates and stores a tenant-scoped document file.' })
  uploadDocument(
    @CurrentAuth() auth: AuthContext,
    @Body() body: UploadDocumentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.documentsService.upload(auth, body, file);
  }

  @Post(':documentId/reprocess')
  @ApiOkResponse({ description: 'Queues a stored tenant document for text reprocessing.' })
  reprocessDocument(@CurrentAuth() auth: AuthContext, @Param('documentId') documentId: string) {
    return this.documentsService.reprocess(auth, documentId);
  }

  @Get(':documentId/download')
  @ApiOkResponse({ description: 'Downloads a document after tenant permission validation.' })
  async downloadDocument(
    @CurrentAuth() auth: AuthContext,
    @Param('documentId') documentId: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const download = await this.documentsService.download(auth, documentId);
    response.set({
      'Content-Type': download.mimeType,
      'Content-Disposition': `attachment; filename="${download.fileName.replace(/["\\]/g, '_')}"`,
      'Content-Length': download.buffer.length.toString(),
    });
    return new StreamableFile(download.buffer);
  }
}
