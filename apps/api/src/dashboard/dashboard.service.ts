import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthContext } from '../auth/auth.types';
import { KnowledgeItem } from '../knowledge/knowledge.schemas';
import { OrganizationsService } from '../organizations/organizations.service';
import { Project } from '../projects/projects.schemas';
import { buildDashboardInsights, RECENT_DECISION_DAYS } from './dashboard-insights';

/** Upper bound on records read per request; far above what one workspace shows today. */
const MAX_RECORDS = 500;

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(KnowledgeItem.name) private readonly knowledgeModel: Model<KnowledgeItem>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async get(auth: AuthContext, now = new Date()) {
    await this.organizationsService.requireMembership(auth, auth.organizationId);
    const organizationId = new Types.ObjectId(auth.organizationId);
    // One extra day so decisions near the cut-off survive the UTC day rounding.
    const decisionsSince = new Date(now.getTime() - (RECENT_DECISION_DAYS + 1) * 86_400_000);

    const [projects, knowledgeItems] = await Promise.all([
      this.projectModel
        .find({ organizationId, deletedAt: null })
        .sort({ updatedAt: -1 })
        .limit(MAX_RECORDS)
        .lean<Array<Project & { updatedAt?: Date }>>(),
      this.knowledgeModel
        .find({
          organizationId,
          deletedAt: null,
          $or: [{ type: 'risk' }, { type: 'decision', createdAt: { $gte: decisionsSince } }],
        })
        .sort({ updatedAt: -1 })
        .limit(MAX_RECORDS)
        .lean<Array<KnowledgeItem & { createdAt?: Date; updatedAt?: Date }>>(),
    ]);

    return {
      data: buildDashboardInsights(
        projects.map((project) => ({
          id: project._id.toString(),
          name: project.name,
          status: project.status,
          riskLevel: project.riskLevel,
          ownerName: project.ownerName ?? null,
          dueDate: project.dueDate ?? null,
          progress: project.progress ?? 0,
          description: project.description ?? '',
          updatedAt: project.updatedAt ?? null,
        })),
        knowledgeItems.map((item) => ({
          id: item._id.toString(),
          title: item.title,
          type: item.type,
          content: item.content ?? '',
          aiSummary: item.aiSummary ?? '',
          projectId: item.projectId?.toString() ?? null,
          createdAt: item.createdAt ?? null,
          updatedAt: item.updatedAt ?? null,
        })),
        now,
      ),
    };
  }
}
