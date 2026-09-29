import * as crypto from 'node:crypto';
import * as path from 'node:path';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import { AuthContext } from '../auth/auth.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { Project } from '../projects/projects.schemas';
import { DocumentStorageService } from './document-storage.service';
import { DocumentChunk } from './document-chunks.schemas';
import { DocumentProcessingQueue } from './document-processing.queue';
import { DocumentProcessorService } from './document-processor.service';
import { CreateDocumentDto, SearchDocumentsDto, UploadDocumentDto } from './documents.dto';
import { Document } from './documents.schemas';

const writeRoles = new Set(['Owner', 'Administrator', 'Manager', 'Member']);

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<DocumentChunk>,
    private readonly organizationsService: OrganizationsService,
    private readonly activityService: ActivityService,
    private readonly storageService: DocumentStorageService,
    private readonly configService: ConfigService,
    private readonly processor: DocumentProcessorService,
    private readonly processingQueue: DocumentProcessingQueue,
  ) {}

  async list(auth: AuthContext, organizationId?: string) {
    const tenantId = organizationId ?? auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    const documents = await this.documentModel
      .find({ organizationId: new Types.ObjectId(tenantId), deletedAt: null })
      .sort({ updatedAt: -1 })
      .lean();
    return { data: documents.map((document) => this.toResponse(document)) };
  }

  async create(auth: AuthContext, body: CreateDocumentDto) {
    this.requireWriteRole(auth);
    const tenantId = body.organizationId ?? auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    if (body.projectId) {
      await this.requireProjectInTenant(tenantId, body.projectId);
    }
    const userId = new Types.ObjectId(auth.userId);
    const document = await this.documentModel.create({
      organizationId: new Types.ObjectId(tenantId),
      projectId: body.projectId ? new Types.ObjectId(body.projectId) : null,
      title: body.title,
      type: body.type,
      source: 'Manual metadata',
      status: 'Metadata only',
      searchableText: body.summary ?? '',
      aiSummary:
        body.summary ?? 'Document metadata created. Upload and extraction pipeline is next.',
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
    });
    await this.activityService.record(auth, {
      organizationId: tenantId,
      eventType: 'document.created',
      entityType: 'document',
      entityId: document._id,
      entityName: document.title,
      metadata: { type: document.type, projectId: body.projectId ?? null },
    });
    return { data: this.toResponse(document.toObject()) };
  }

  async upload(auth: AuthContext, body: UploadDocumentDto, file?: Express.Multer.File) {
    this.requireWriteRole(auth);
    if (!file) {
      throw new BadRequestException('A document file is required.');
    }
    const tenantId = auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    if (body.projectId) {
      await this.requireProjectInTenant(tenantId, body.projectId);
    }
    this.validateUpload(file);

    const userId = new Types.ObjectId(auth.userId);
    const documentId = new Types.ObjectId();
    const documentType = this.documentType(file.originalname);
    const safeFileName = this.safeFileName(file.originalname);
    const storageKey = `${tenantId}/${documentId.toString()}/${safeFileName}`;
    const checksumSha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const isText = documentType === 'TXT' || documentType === 'Markdown';

    const document = await this.documentModel.create({
      _id: documentId,
      organizationId: new Types.ObjectId(tenantId),
      projectId: body.projectId ? new Types.ObjectId(body.projectId) : null,
      title: body.title?.trim() || path.parse(file.originalname).name,
      type: documentType,
      source: 'File upload',
      status: 'Uploading',
      searchableText: '',
      aiSummary: 'File stored. Text extraction is pending.',
      storageKey,
      originalFileName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size,
      checksumSha256,
      processingError: null,
      extractedAt: null,
      chunkCount: 0,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
    });

    try {
      await this.storageService.put(storageKey, file.buffer, document.mimeType ?? file.mimetype);
    } catch (error) {
      document.status = 'Upload failed';
      document.processingError = error instanceof Error ? error.message : 'Storage upload failed.';
      await document.save();
      throw error;
    }
    if (isText) {
      try {
        await this.processor.processText(
          document._id,
          document.organizationId,
          file.buffer.toString('utf8'),
        );
      } catch (error) {
        await this.processor.markFailed(document._id.toString(), tenantId, error);
      }
    } else {
      document.status = 'Processing queued';
      await document.save();
      try {
        await this.processingQueue.enqueue({
          documentId: document._id.toString(),
          organizationId: tenantId,
        });
      } catch (error) {
        document.status = 'Queue unavailable';
        document.processingError =
          error instanceof Error ? error.message.slice(0, 500) : 'Processing queue unavailable.';
        await document.save();
      }
    }

    await this.activityService.record(auth, {
      organizationId: tenantId,
      eventType: 'document.uploaded',
      entityType: 'document',
      entityId: document._id,
      entityName: document.title,
      metadata: {
        type: document.type,
        sizeBytes: document.sizeBytes,
        projectId: body.projectId ?? null,
      },
    });
    const updated = await this.documentModel.findById(document._id).lean();
    return { data: this.toResponse(updated ?? document.toObject()) };
  }

  async reprocess(auth: AuthContext, documentId: string) {
    this.requireWriteRole(auth);
    if (!Types.ObjectId.isValid(documentId)) throw new NotFoundException('Document not found.');
    await this.organizationsService.requireMembership(auth, auth.organizationId);
    const document = await this.documentModel.findOne({
      _id: new Types.ObjectId(documentId),
      organizationId: new Types.ObjectId(auth.organizationId),
      deletedAt: null,
      storageKey: { $ne: null },
    });
    if (!document) throw new NotFoundException('Document file not found.');
    document.status = 'Processing queued';
    document.processingError = null;
    await document.save();
    try {
      await this.processingQueue.enqueue({
        documentId: document._id.toString(),
        organizationId: auth.organizationId,
      });
    } catch (error) {
      document.status = 'Queue unavailable';
      document.processingError =
        error instanceof Error ? error.message.slice(0, 500) : 'Processing queue unavailable.';
      await document.save();
    }
    return { data: this.toResponse(document.toObject()) };
  }

  async search(auth: AuthContext, query: SearchDocumentsDto) {
    await this.organizationsService.requireMembership(auth, auth.organizationId);
    if (query.projectId) await this.requireProjectInTenant(auth.organizationId, query.projectId);
    const terms = query.query
      .trim()
      .split(/\s+/)
      .map((term) => term.replace(/[^\p{L}\p{N}_-]/gu, ''))
      .filter(Boolean)
      .slice(0, 12);
    if (!terms.length) throw new BadRequestException('Search query must contain searchable text.');
    const organizationId = new Types.ObjectId(auth.organizationId);
    const chunks = await this.chunkModel
      .find(
        {
          organizationId,
          ...(query.projectId ? { projectId: new Types.ObjectId(query.projectId) } : {}),
          $text: { $search: terms.join(' ') },
        },
        { score: { $meta: 'textScore' } },
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .lean();
    const documentIds = [...new Set(chunks.map((chunk) => chunk.documentId.toString()))].map(
      (id) => new Types.ObjectId(id),
    );
    const documents = await this.documentModel
      .find({ _id: { $in: documentIds }, organizationId, deletedAt: null })
      .lean();
    const documentsById = new Map(documents.map((document) => [document._id.toString(), document]));
    return {
      data: chunks.flatMap((chunk) => {
        const document = documentsById.get(chunk.documentId.toString());
        return document
          ? [
              {
                documentId: document._id.toString(),
                title: document.title,
                type: document.type,
                projectId: document.projectId?.toString() ?? null,
                chunkIndex: chunk.chunkIndex,
                excerpt: chunk.content.slice(0, 500),
                score: (chunk as unknown as { score?: number }).score ?? null,
                sourceUrl: `/api/v1/documents/${document._id.toString()}/download`,
              },
            ]
          : [];
      }),
    };
  }

  async download(auth: AuthContext, documentId: string) {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new NotFoundException('Document not found.');
    }
    await this.organizationsService.requireMembership(auth, auth.organizationId);
    const document = await this.documentModel
      .findOne({
        _id: new Types.ObjectId(documentId),
        organizationId: new Types.ObjectId(auth.organizationId),
        deletedAt: null,
      })
      .lean();
    if (!document?.storageKey) {
      throw new NotFoundException('Document file not found.');
    }
    const stored = await this.storageService.get(document.storageKey);
    if (!stored.Body) {
      throw new NotFoundException('Document file not found.');
    }
    return {
      buffer: Buffer.from(await stored.Body.transformToByteArray()),
      fileName: document.originalFileName ?? `${document.title}.${document.type.toLowerCase()}`,
      mimeType: document.mimeType ?? 'application/octet-stream',
    };
  }

  private async requireProjectInTenant(organizationId: string, projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found.');
    }
    const exists = await this.projectModel.exists({
      _id: new Types.ObjectId(projectId),
      organizationId: new Types.ObjectId(organizationId),
      deletedAt: null,
    });
    if (!exists) {
      throw new NotFoundException('Project not found.');
    }
  }

  private requireWriteRole(auth: AuthContext) {
    if (!writeRoles.has(auth.role)) {
      throw new ForbiddenException('You do not have permission to change documents.');
    }
  }

  private toResponse(document: Document & { createdAt?: Date; updatedAt?: Date }) {
    return {
      id: document._id.toString(),
      organizationId: document.organizationId.toString(),
      projectId: document.projectId?.toString() ?? null,
      title: document.title,
      type: document.type,
      source: document.source,
      status: document.status,
      aiSummary: document.aiSummary,
      originalFileName: document.originalFileName ?? null,
      mimeType: document.mimeType ?? null,
      sizeBytes: document.sizeBytes ?? null,
      checksumSha256: document.checksumSha256 ?? null,
      processingError: document.processingError ?? null,
      chunkCount: document.chunkCount ?? 0,
      extractedAt: document.extractedAt?.toISOString() ?? null,
      createdAt: document.createdAt?.toISOString() ?? null,
      updatedAt: document.updatedAt?.toISOString() ?? null,
    };
  }

  private validateUpload(file: Express.Multer.File) {
    const maximumBytes =
      this.configService.getOrThrow<number>('DOCUMENT_MAX_SIZE_MB') * 1024 * 1024;
    if (file.size > maximumBytes) {
      throw new PayloadTooLargeException('Document exceeds the configured upload size limit.');
    }
    if (file.buffer.includes(Buffer.from('EICAR-STANDARD-ANTIVIRUS-TEST-FILE'))) {
      throw new BadRequestException('Document failed the malware safety check.');
    }
    const type = this.documentType(file.originalname);
    const validSignature =
      (type === 'PDF' && file.buffer.subarray(0, 4).toString() === '%PDF') ||
      (type === 'DOCX' && file.buffer[0] === 0x50 && file.buffer[1] === 0x4b) ||
      type === 'TXT' ||
      type === 'Markdown';
    if (!validSignature) {
      throw new UnsupportedMediaTypeException(
        'File content does not match its supported document type.',
      );
    }
  }

  private documentType(fileName: string) {
    const extension = path.extname(fileName).toLowerCase();
    const typeByExtension: Record<string, string> = {
      '.pdf': 'PDF',
      '.docx': 'DOCX',
      '.txt': 'TXT',
      '.md': 'Markdown',
      '.markdown': 'Markdown',
    };
    const type = typeByExtension[extension];
    if (!type) {
      throw new UnsupportedMediaTypeException(
        'Only PDF, DOCX, TXT, and Markdown files are supported.',
      );
    }
    return type;
  }

  private safeFileName(fileName: string) {
    const normalized = path.basename(fileName).replace(/[^a-zA-Z0-9._-]+/g, '-');
    return normalized.slice(-180) || 'document';
  }
}
