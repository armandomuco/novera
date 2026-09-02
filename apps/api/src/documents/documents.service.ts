import * as crypto from 'node:crypto';
import * as path from 'node:path';
import {
  BadRequestException,
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
import { CreateDocumentDto, UploadDocumentDto } from './documents.dto';
import { Document } from './documents.schemas';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly organizationsService: OrganizationsService,
    private readonly activityService: ActivityService,
    private readonly storageService: DocumentStorageService,
    private readonly configService: ConfigService,
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
    const searchableText = isText
      ? file.buffer.toString('utf8').replace(/\0/g, '').slice(0, 2_000_000)
      : '';

    const document = await this.documentModel.create({
      _id: documentId,
      organizationId: new Types.ObjectId(tenantId),
      projectId: body.projectId ? new Types.ObjectId(body.projectId) : null,
      title: body.title?.trim() || path.parse(file.originalname).name,
      type: documentType,
      source: 'File upload',
      status: 'Uploading',
      searchableText,
      aiSummary: isText
        ? 'Text extracted. AI summary generation is pending.'
        : 'File stored. Text extraction is pending.',
      storageKey,
      originalFileName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      sizeBytes: file.size,
      checksumSha256,
      processingError: null,
      extractedAt: isText ? new Date() : null,
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
    });

    try {
      await this.storageService.put(storageKey, file.buffer, document.mimeType ?? file.mimetype);
      document.status = isText ? 'Text extracted' : 'Extraction pending';
      await document.save();
    } catch (error) {
      document.status = 'Upload failed';
      document.processingError = error instanceof Error ? error.message : 'Storage upload failed.';
      await document.save();
      throw error;
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
    return { data: this.toResponse(document.toObject()) };
  }

  async download(auth: AuthContext, documentId: string) {
    if (!Types.ObjectId.isValid(documentId)) {
      throw new NotFoundException('Document not found.');
    }
    const document = await this.documentModel
      .findOne({ _id: new Types.ObjectId(documentId), deletedAt: null })
      .lean();
    if (!document?.storageKey) {
      throw new NotFoundException('Document file not found.');
    }
    await this.organizationsService.requireMembership(auth, document.organizationId.toString());
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
