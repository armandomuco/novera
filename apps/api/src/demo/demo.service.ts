import * as crypto from 'node:crypto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DemoActivityEvent,
  DemoDocument,
  DemoKnowledgeItem,
  DemoOrganization,
  DemoProject,
  DemoRisk,
  DemoUser,
} from './demo.schemas';

@Injectable()
export class DemoService {
  constructor(
    @InjectModel(DemoUser.name) private readonly userModel: Model<DemoUser>,
    @InjectModel(DemoOrganization.name) private readonly organizationModel: Model<DemoOrganization>,
    @InjectModel(DemoProject.name) private readonly projectModel: Model<DemoProject>,
    @InjectModel(DemoKnowledgeItem.name) private readonly knowledgeModel: Model<DemoKnowledgeItem>,
    @InjectModel(DemoDocument.name) private readonly documentModel: Model<DemoDocument>,
    @InjectModel(DemoRisk.name) private readonly riskModel: Model<DemoRisk>,
    @InjectModel(DemoActivityEvent.name) private readonly activityModel: Model<DemoActivityEvent>,
  ) {}

  async getWorkspace() {
    const organization = await this.organizationModel.findOne({ slug: 'acme-studio' }).lean();
    if (!organization) {
      throw new NotFoundException('Demo workspace is not seeded. Run npm run seed:demo.');
    }

    const organizationId = organization._id;
    const [users, projects, knowledgeItems, documents, risks, activities] = await Promise.all([
      this.userModel.find({ email: /@novera\.test$/ }).sort({ roleLabel: 1 }).lean(),
      this.projectModel.find({ organizationId }).sort({ dueDate: 1 }).lean(),
      this.knowledgeModel.find({ organizationId }).sort({ title: 1 }).lean(),
      this.documentModel.find({ organizationId }).sort({ title: 1 }).lean(),
      this.riskModel.find({ organizationId }).sort({ severity: 1 }).lean(),
      this.activityModel.find({ organizationId }).sort({ createdAt: -1 }).lean(),
    ]);

    const projectNames = new Map(projects.map((project) => [project._id.toString(), project.name]));

    return {
      data: {
        organization: {
          id: organization._id.toString(),
          name: organization.name,
          slug: organization.slug,
          industry: organization.industry,
        },
        users: users.map((user) => ({
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.roleLabel,
          status: user.status,
        })),
        projects: projects.map((project) => ({
          id: project._id.toString(),
          name: project.name,
          status: project.status,
          risk: project.riskLevel ?? 'Medium',
          owner: project.ownerName ?? 'Unassigned',
          due: project.dueDate?.toISOString() ?? null,
          progress: project.progress ?? this.deriveProgress(project.status),
          summary: project.description ?? '',
          objectives: project.objectives ?? [],
        })),
        knowledgeItems: knowledgeItems.map((item) => ({
          id: item._id.toString(),
          title: item.title,
          type: this.formatType(item.type),
          source: item.source ?? 'Manual entry',
          summary: item.aiSummary ?? item.content ?? '',
          project: this.projectName(projectNames, item.projectId),
        })),
        documents: documents.map((document) => ({
          id: document._id.toString(),
          title: document.title,
          type: this.documentType(document.mimeType),
          status: this.formatType(document.processingStatus ?? 'pending'),
          project: this.projectName(projectNames, document.projectId),
          updated: 'Seeded',
        })),
        risks: risks.map((risk) => ({
          id: risk._id.toString(),
          title: risk.title,
          severity: risk.severity ?? 'Medium',
          owner: risk.ownerName ?? 'Unassigned',
          mitigation: risk.mitigation ?? '',
        })),
        activities: activities.map((activity) => ({
          id: activity._id.toString(),
          actor: activity.actorName ?? 'System',
          action: this.formatType(activity.eventType ?? 'activity'),
          target: activity.entityName ?? 'Workspace',
          time: 'Seeded recently',
        })),
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) {
      throw new NotFoundException('Demo user not found. Run npm run seed:demo.');
    }

    if (!user.password || !this.verifyPassword(password, user.password)) {
      throw new UnauthorizedException('Invalid demo credentials.');
    }

    return {
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.roleLabel,
        status: user.status,
      },
    };
  }

  async updateProfile(email: string, name: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: { name, updatedAt: new Date() } },
        { new: true },
      )
      .lean();

    if (!user) {
      throw new NotFoundException('Demo user not found.');
    }

    return {
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.roleLabel,
        status: user.status,
      },
    };
  }

  async createProject(body: { name: string; owner: string; summary?: string }) {
    const organization = await this.requireOrganization();
    const project = await this.projectModel.create({
      organizationId: organization._id,
      name: body.name,
      status: 'Planning',
      riskLevel: 'Medium',
      ownerName: body.owner,
      description: body.summary ?? 'New project created from the Novera workspace.',
      objectives: ['Define objectives', 'Assign owners', 'Collect source documents'],
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    await this.recordActivity(organization._id, 'Olivia Stone', 'project.created', 'project', project.name);
    return this.getWorkspace();
  }

  async createKnowledgeItem(body: { title: string; type: string; summary?: string }) {
    const organization = await this.requireOrganization();
    const item = await this.knowledgeModel.create({
      organizationId: organization._id,
      title: body.title,
      type: body.type.toLowerCase().replace(/\s+/g, '_'),
      source: 'Workspace entry',
      content: body.summary ?? 'New knowledge item created from the Novera workspace.',
      aiSummary: body.summary ?? 'New knowledge item created from the Novera workspace.',
      embeddingStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    await this.recordActivity(organization._id, 'Olivia Stone', 'knowledge.created', 'knowledge_item', item.title);
    return this.getWorkspace();
  }

  async createDocument(body: { title: string; type?: string }) {
    const organization = await this.requireOrganization();
    const mimeType = this.mimeTypeFor(body.type);
    const document = await this.documentModel.create({
      organizationId: organization._id,
      title: body.title,
      fileName: `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${this.extensionFor(body.type)}`,
      mimeType,
      sizeBytes: 10240,
      processingStatus: 'pending',
      aiSummary: 'Document metadata created. Upload and extraction pipeline is next.',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    await this.recordActivity(organization._id, 'Leo Marin', 'document.created', 'document', document.title);
    return this.getWorkspace();
  }

  private deriveProgress(status: string) {
    if (status.toLowerCase().includes('delayed')) return 62;
    if (status.toLowerCase().includes('track')) return 78;
    return 44;
  }

  private documentType(mimeType?: string) {
    if (!mimeType) return 'File';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word')) return 'DOCX';
    if (mimeType.includes('markdown')) return 'Markdown';
    if (mimeType.includes('text')) return 'TXT';
    return 'File';
  }

  private formatType(value: string) {
    return value
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private projectName(projectNames: Map<string, string>, projectId?: Types.ObjectId) {
    return projectId ? (projectNames.get(projectId.toString()) ?? 'Unassigned') : 'Unassigned';
  }

  private async requireOrganization() {
    const organization = await this.organizationModel.findOne({ slug: 'acme-studio' });
    if (!organization) {
      throw new NotFoundException('Demo workspace is not seeded. Run npm run seed:demo.');
    }
    return organization;
  }

  private async recordActivity(
    organizationId: Types.ObjectId,
    actorName: string,
    eventType: string,
    entityType: string,
    entityName: string,
  ) {
    await this.activityModel.create({
      organizationId,
      actorName,
      eventType,
      entityType,
      entityName,
      metadata: { source: 'demo-api' },
      createdAt: new Date(),
    });
  }

  private mimeTypeFor(type?: string) {
    const normalized = type?.toLowerCase();
    if (normalized === 'pdf') return 'application/pdf';
    if (normalized === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (normalized === 'markdown') return 'text/markdown';
    return 'text/plain';
  }

  private extensionFor(type?: string) {
    const normalized = type?.toLowerCase();
    if (normalized === 'pdf') return 'pdf';
    if (normalized === 'docx') return 'docx';
    if (normalized === 'markdown') return 'md';
    return 'txt';
  }

  private verifyPassword(password: string, storedPassword: string) {
    if (!storedPassword.startsWith('scrypt:')) {
      return password === storedPassword;
    }

    const [, salt, hash] = storedPassword.split(':');
    if (!salt || !hash) {
      return false;
    }

    const candidate = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(candidate, 'hex'), Buffer.from(hash, 'hex'));
  }
}
