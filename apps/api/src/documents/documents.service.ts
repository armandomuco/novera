import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import { AuthContext } from '../auth/auth.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { Project } from '../projects/projects.schemas';
import { CreateDocumentDto } from './documents.dto';
import { Document } from './documents.schemas';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<Document>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly organizationsService: OrganizationsService,
    private readonly activityService: ActivityService,
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
      aiSummary: body.summary ?? 'Document metadata created. Upload and extraction pipeline is next.',
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
      createdAt: document.createdAt?.toISOString() ?? null,
      updatedAt: document.updatedAt?.toISOString() ?? null,
    };
  }
}
