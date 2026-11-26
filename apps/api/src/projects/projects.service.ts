import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import { AuthContext } from '../auth/auth.types';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { Project } from './projects.schemas';

const writeRoles = new Set(['Owner', 'Administrator', 'Manager']);

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    private readonly organizationsService: OrganizationsService,
    private readonly activityService: ActivityService,
  ) {}

  async list(auth: AuthContext, organizationId?: string) {
    const tenantId = organizationId ?? auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    const projects = await this.projectModel
      .find({ organizationId: new Types.ObjectId(tenantId), deletedAt: null })
      .sort({ updatedAt: -1 })
      .lean();

    return { data: projects.map((project) => this.toResponse(project)) };
  }

  async create(auth: AuthContext, body: CreateProjectDto) {
    this.requireWriteRole(auth);
    const tenantId = body.organizationId ?? auth.organizationId;
    await this.organizationsService.requireMembership(auth, tenantId);
    const userId = new Types.ObjectId(auth.userId);
    const project = await this.projectModel.create({
      organizationId: new Types.ObjectId(tenantId),
      name: body.name,
      description: body.description ?? '',
      status: body.status ?? 'Planning',
      riskLevel: body.riskLevel ?? 'Medium',
      ownerName: body.ownerName,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      progress: body.progress ?? 0,
      objectives: body.objectives ?? [],
      createdBy: userId,
      updatedBy: userId,
      deletedAt: null,
    });
    await this.activityService.record(auth, {
      organizationId: tenantId,
      eventType: 'project.created',
      entityType: 'project',
      entityId: project._id,
      entityName: project.name,
    });

    return { data: this.toResponse(project.toObject()) };
  }

  async get(auth: AuthContext, projectId: string) {
    const project = await this.findTenantProject(auth, projectId);
    return { data: this.toResponse(project) };
  }

  async update(auth: AuthContext, projectId: string, body: UpdateProjectDto) {
    this.requireWriteRole(auth);
    const project = await this.findTenantProject(auth, projectId);
    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: project._id, organizationId: project.organizationId, deletedAt: null },
        {
          $set: {
            ...this.updatePayload(body),
            updatedBy: new Types.ObjectId(auth.userId),
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .lean();
    if (!updated) {
      throw new NotFoundException('Project not found.');
    }
    await this.activityService.record(auth, {
      organizationId: updated.organizationId,
      eventType: 'project.updated',
      entityType: 'project',
      entityId: updated._id,
      entityName: updated.name,
      metadata: { changedFields: Object.keys(body) },
    });
    return { data: this.toResponse(updated) };
  }

  async archive(auth: AuthContext, projectId: string) {
    this.requireWriteRole(auth);
    const project = await this.findTenantProject(auth, projectId);
    await this.projectModel.updateOne(
      { _id: project._id, organizationId: project.organizationId, deletedAt: null },
      {
        $set: {
          status: 'Archived',
          deletedAt: new Date(),
          updatedBy: new Types.ObjectId(auth.userId),
          updatedAt: new Date(),
        },
      },
    );
    await this.activityService.record(auth, {
      organizationId: project.organizationId,
      eventType: 'project.archived',
      entityType: 'project',
      entityId: project._id,
      entityName: project.name,
    });
    return { data: { archived: true, id: project._id.toString() } };
  }

  private async findTenantProject(auth: AuthContext, projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new NotFoundException('Project not found.');
    }
    await this.organizationsService.requireMembership(auth, auth.organizationId);
    const project = await this.projectModel
      .findOne({
        _id: new Types.ObjectId(projectId),
        organizationId: new Types.ObjectId(auth.organizationId),
        deletedAt: null,
      })
      .lean();
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    return project;
  }

  private requireWriteRole(auth: AuthContext) {
    if (!writeRoles.has(auth.role)) {
      throw new ForbiddenException('You do not have permission to change projects.');
    }
  }

  private updatePayload(body: UpdateProjectDto) {
    return {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.riskLevel !== undefined ? { riskLevel: body.riskLevel } : {}),
      ...(body.ownerName !== undefined ? { ownerName: body.ownerName } : {}),
      ...(body.dueDate !== undefined
        ? { dueDate: body.dueDate === null ? null : new Date(body.dueDate) }
        : {}),
      ...(body.progress !== undefined ? { progress: body.progress } : {}),
      ...(body.objectives !== undefined ? { objectives: body.objectives } : {}),
    };
  }

  private toResponse(project: Project & { createdAt?: Date; updatedAt?: Date }) {
    return {
      id: project._id.toString(),
      organizationId: project.organizationId.toString(),
      name: project.name,
      status: project.status,
      riskLevel: project.riskLevel,
      ownerName: project.ownerName ?? null,
      dueDate: project.dueDate?.toISOString() ?? null,
      // Records created before progress was stored have no value; report them as not started.
      progress: project.progress ?? 0,
      description: project.description,
      objectives: project.objectives,
      createdAt: project.createdAt?.toISOString() ?? null,
      updatedAt: project.updatedAt?.toISOString() ?? null,
    };
  }
}
