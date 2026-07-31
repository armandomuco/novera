import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import { AuthContext } from '../auth/auth.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { Project } from '../projects/projects.schemas';
import { CreateKnowledgeItemDto, UpdateKnowledgeItemDto } from './knowledge.dto';
import { KnowledgeItem } from './knowledge.schemas';

const writeRoles = new Set(['Owner', 'Administrator', 'Manager', 'Member']);

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(KnowledgeItem.name) private readonly knowledgeModel: Model<KnowledgeItem>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly organizationsService: OrganizationsService,
    private readonly activityService: ActivityService,
  ) {}

  async list(auth: AuthContext, filters: { organizationId?: string; projectId?: string; type?: string }) {
    const tenantId = filters.organizationId ?? auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    const query: Record<string, unknown> = {
      organizationId: new Types.ObjectId(tenantId),
      deletedAt: null,
    };
    if (filters.projectId) {
      query.projectId = new Types.ObjectId(filters.projectId);
    }
    if (filters.type) {
      query.type = filters.type;
    }
    const items = await this.knowledgeModel.find(query).sort({ updatedAt: -1 }).lean();
    return { data: items.map((item) => this.toResponse(item)) };
  }

  async create(auth: AuthContext, body: CreateKnowledgeItemDto) {
    this.requireWriteRole(auth);
    const tenantId = body.organizationId ?? auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    if (body.projectId) {
      await this.requireProjectInTenant(tenantId, body.projectId);
    }
    const userId = new Types.ObjectId(auth.userId);
    const item = await this.knowledgeModel.create({
      organizationId: new Types.ObjectId(tenantId),
      projectId: body.projectId ? new Types.ObjectId(body.projectId) : undefined,
      customerId: body.customerId,
      title: body.title,
      type: body.type,
      source: body.source ?? 'Manual entry',
      content: body.content,
      tags: body.tags ?? [],
      aiSummary: this.initialSummary(body.content),
      embeddingStatus: 'pending',
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
    });
    await this.activityService.record(auth, {
      organizationId: tenantId,
      eventType: 'knowledge.created',
      entityType: 'knowledge_item',
      entityId: item._id,
      entityName: item.title,
      metadata: { type: item.type, projectId: item.projectId?.toString() ?? null },
    });
    return { data: this.toResponse(item.toObject()) };
  }

  async get(auth: AuthContext, itemId: string) {
    const item = await this.findTenantItem(auth, itemId);
    return { data: this.toResponse(item) };
  }

  async update(auth: AuthContext, itemId: string, body: UpdateKnowledgeItemDto) {
    this.requireWriteRole(auth);
    const item = await this.findTenantItem(auth, itemId);
    const updated = await this.knowledgeModel
      .findOneAndUpdate(
        { _id: item._id, organizationId: item.organizationId, deletedAt: null },
        {
          $set: {
            ...this.updatePayload(body),
            ...(body.content ? { aiSummary: this.initialSummary(body.content), embeddingStatus: 'pending' } : {}),
            updatedBy: new Types.ObjectId(auth.userId),
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
    if (!updated) {
      throw new NotFoundException('Knowledge item not found.');
    }
    await this.activityService.record(auth, {
      organizationId: updated.organizationId,
      eventType: 'knowledge.updated',
      entityType: 'knowledge_item',
      entityId: updated._id,
      entityName: updated.title,
      metadata: { changedFields: Object.keys(body) },
    });
    return { data: this.toResponse(updated) };
  }

  async archive(auth: AuthContext, itemId: string) {
    this.requireWriteRole(auth);
    const item = await this.findTenantItem(auth, itemId);
    await this.knowledgeModel.updateOne(
      { _id: item._id, organizationId: item.organizationId, deletedAt: null },
      {
        $set: {
          deletedAt: new Date(),
          updatedBy: new Types.ObjectId(auth.userId),
          updatedAt: new Date(),
        },
      },
    );
    await this.activityService.record(auth, {
      organizationId: item.organizationId,
      eventType: 'knowledge.archived',
      entityType: 'knowledge_item',
      entityId: item._id,
      entityName: item.title,
    });
    return { data: { archived: true, id: item._id.toString() } };
  }

  private async findTenantItem(auth: AuthContext, itemId: string) {
    if (!Types.ObjectId.isValid(itemId)) {
      throw new NotFoundException('Knowledge item not found.');
    }
    const item = await this.knowledgeModel.findOne({ _id: itemId, deletedAt: null }).lean();
    if (!item) {
      throw new NotFoundException('Knowledge item not found.');
    }
    await this.organizationsService.requireMembership(auth, item.organizationId.toString());
    return item;
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
      throw new NotFoundException('Project not found in this organization.');
    }
  }

  private requireWriteRole(auth: AuthContext) {
    if (!writeRoles.has(auth.role)) {
      throw new ForbiddenException('You do not have permission to change knowledge items.');
    }
  }

  private updatePayload(body: UpdateKnowledgeItemDto) {
    return {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.type !== undefined ? { type: body.type } : {}),
      ...(body.source !== undefined ? { source: body.source } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.tags !== undefined ? { tags: body.tags } : {}),
    };
  }

  private initialSummary(content: string) {
    return content.length > 240 ? `${content.slice(0, 237)}...` : content;
  }

  private toResponse(item: KnowledgeItem & { createdAt?: Date; updatedAt?: Date }) {
    return {
      id: item._id.toString(),
      organizationId: item.organizationId.toString(),
      projectId: item.projectId?.toString() ?? null,
      customerId: item.customerId ?? null,
      title: item.title,
      type: item.type,
      source: item.source,
      content: item.content,
      tags: item.tags,
      aiSummary: item.aiSummary,
      embeddingStatus: item.embeddingStatus,
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    };
  }
}
