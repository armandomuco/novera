import { Types } from 'mongoose';
import { AuthContext } from '../src/auth/auth.types';
import {
  buildDashboardInsights,
  InsightKnowledgeItem,
  InsightProject,
} from '../src/dashboard/dashboard-insights';
import { DashboardService } from '../src/dashboard/dashboard.service';

const now = new Date('2026-11-26T10:00:00Z');
const daysFromNow = (days: number) => new Date(now.getTime() + days * 86_400_000);

function project(overrides: Partial<InsightProject>): InsightProject {
  return {
    id: new Types.ObjectId().toString(),
    name: 'Project',
    status: 'Active',
    riskLevel: 'Medium',
    ownerName: 'Mira Chen',
    dueDate: null,
    progress: 30,
    description: '',
    updatedAt: now,
    ...overrides,
  };
}

function knowledge(overrides: Partial<InsightKnowledgeItem>): InsightKnowledgeItem {
  return {
    id: new Types.ObjectId().toString(),
    title: 'Item',
    type: 'note',
    content: '',
    aiSummary: '',
    projectId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('dashboard insights', () => {
  it('flags overdue, delayed and high-risk projects, and nothing else', () => {
    const insights = buildDashboardInsights(
      [
        project({ name: 'Overdue', dueDate: daysFromNow(-3) }),
        project({ name: 'Delayed', status: 'Delayed' }),
        project({ name: 'High', riskLevel: 'High', dueDate: daysFromNow(30) }),
        project({ name: 'Healthy', dueDate: daysFromNow(30) }),
        project({ name: 'Finished late', dueDate: daysFromNow(-10), progress: 100 }),
        project({ name: 'Archived', status: 'Archived', riskLevel: 'High' }),
      ],
      [],
      now,
    );

    expect(insights.risks.map((risk) => [risk.title, risk.severity, risk.reasons])).toEqual([
      ['Overdue', 'High', ['overdue']],
      ['High', 'High', ['high_risk']],
      ['Delayed', 'Medium', ['delayed']],
    ]);
    expect(insights.risks[0].daysOverdue).toBe(3);
    expect(insights.summary).toMatchObject({ openRisks: 3, overdueProjects: 1 });
  });

  it('does not treat a project due today as overdue', () => {
    const insights = buildDashboardInsights(
      [project({ name: 'Due today', dueDate: new Date('2026-11-26T00:00:00Z') })],
      [],
      now,
    );
    expect(insights.risks).toEqual([]);
    expect(insights.priorities).toMatchObject([{ kind: 'due_soon_project', days: 0 }]);
  });

  it('includes risks recorded as knowledge items, with their project name', () => {
    const atlas = project({ name: 'Atlas onboarding' });
    const insights = buildDashboardInsights(
      [atlas],
      [
        knowledge({
          title: 'CRM credentials missing',
          type: 'risk',
          content: 'Escalate to the customer sponsor.',
          projectId: atlas.id,
        }),
      ],
      now,
    );
    expect(insights.risks).toMatchObject([
      {
        source: 'knowledge',
        title: 'CRM credentials missing',
        severity: null,
        detail: 'Escalate to the customer sponsor.',
        projectName: 'Atlas onboarding',
      },
    ]);
  });

  it('orders priorities: overdue, at risk, due soon, then recent decisions', () => {
    const insights = buildDashboardInsights(
      [
        project({ name: 'Due soon', dueDate: daysFromNow(4) }),
        project({ name: 'Slightly late', dueDate: daysFromNow(-1) }),
        project({ name: 'Very late', dueDate: daysFromNow(-9) }),
        project({ name: 'Delayed', status: 'Delayed', dueDate: daysFromNow(20) }),
        project({ name: 'High risk', riskLevel: 'High', dueDate: daysFromNow(40) }),
        project({ name: 'Later', dueDate: daysFromNow(60) }),
      ],
      [
        knowledge({ title: 'Old decision', type: 'decision', createdAt: daysFromNow(-20) }),
        knowledge({ title: 'New decision', type: 'decision', createdAt: daysFromNow(-2) }),
      ],
      now,
    );

    expect(insights.priorities.map((priority) => [priority.kind, priority.title])).toEqual([
      ['overdue_project', 'Very late'],
      ['overdue_project', 'Slightly late'],
      ['at_risk_project', 'High risk'],
      ['at_risk_project', 'Delayed'],
      ['due_soon_project', 'Due soon'],
      ['recent_decision', 'New decision'],
    ]);
    expect(insights.priorities[0].days).toBe(9);
    expect(insights.summary.recentDecisions).toBe(1);
  });

  it('returns empty insights for an empty workspace', () => {
    expect(buildDashboardInsights([], [], now)).toMatchObject({
      summary: { openRisks: 0, overdueProjects: 0, dueSoonProjects: 0, recentDecisions: 0 },
      risks: [],
      priorities: [],
    });
  });
});

describe('dashboard service tenant isolation', () => {
  it('checks membership and reads only the active organization', async () => {
    const organizationId = new Types.ObjectId().toString();
    const auth: AuthContext = {
      userId: new Types.ObjectId().toString(),
      email: 'viewer@novera.test',
      sessionId: new Types.ObjectId().toString(),
      organizationId,
      role: 'Viewer',
    };
    const chain = { sort: () => chain, limit: () => chain, lean: () => Promise.resolve([]) };
    const projectFind = jest.fn().mockReturnValue(chain);
    const knowledgeFind = jest.fn().mockReturnValue(chain);
    const organizationsService = { requireMembership: jest.fn().mockResolvedValue({}) };
    const service = new DashboardService(
      { find: projectFind } as never,
      { find: knowledgeFind } as never,
      organizationsService as never,
    );

    await service.get(auth, now);

    expect(organizationsService.requireMembership).toHaveBeenCalledWith(auth, organizationId);
    for (const find of [projectFind, knowledgeFind]) {
      const filter = find.mock.calls[0][0] as { organizationId: Types.ObjectId; deletedAt: null };
      expect(filter.organizationId.toString()).toBe(organizationId);
      expect(filter.deletedAt).toBeNull();
    }
  });
});
