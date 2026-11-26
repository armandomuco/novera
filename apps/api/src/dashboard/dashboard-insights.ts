// Derives the dashboard's risks and priorities from records people already keep:
// project status, risk level, due date and progress, plus knowledge items of type
// "risk" and "decision". Nothing here is stored; it is recalculated on every request.

const DAY_MS = 86_400_000;
export const DUE_SOON_DAYS = 7;
export const RECENT_DECISION_DAYS = 14;
const MAX_RISKS = 10;
const MAX_PRIORITIES = 6;
const DETAIL_LENGTH = 240;

export type InsightProject = {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  ownerName: string | null;
  dueDate: Date | null;
  progress: number;
  description: string;
  updatedAt: Date | null;
};

export type InsightKnowledgeItem = {
  id: string;
  title: string;
  type: string;
  content: string;
  aiSummary: string;
  projectId: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type RiskReason = 'overdue' | 'delayed' | 'high_risk';

export type DashboardRisk = {
  source: 'project' | 'knowledge';
  entityId: string;
  title: string;
  /** Null for risks recorded as knowledge items, which carry no severity. */
  severity: 'High' | 'Medium' | null;
  reasons: RiskReason[];
  detail: string;
  projectName: string | null;
  ownerName: string | null;
  dueDate: string | null;
  daysOverdue: number | null;
};

export type PriorityKind =
  'overdue_project' | 'at_risk_project' | 'due_soon_project' | 'recent_decision';

export type DashboardPriority = {
  kind: PriorityKind;
  entityId: string;
  title: string;
  projectName: string | null;
  ownerName: string | null;
  dueDate: string | null;
  /** Why a project is listed; empty for decisions. */
  reasons: RiskReason[];
  /**
   * overdue_project: days past the due date; due_soon_project: days until it;
   * recent_decision: days since it was recorded; at_risk_project: null.
   */
  days: number | null;
};

export type DashboardInsights = {
  summary: {
    openRisks: number;
    overdueProjects: number;
    dueSoonProjects: number;
    recentDecisions: number;
  };
  risks: DashboardRisk[];
  priorities: DashboardPriority[];
  generatedAt: string;
};

type ProjectState = {
  project: InsightProject;
  /** Whole days from today (UTC) to the due date; negative when overdue. */
  daysUntilDue: number | null;
  isOverdue: boolean;
  isDueSoon: boolean;
  isDelayed: boolean;
  isHighRisk: boolean;
};

export function buildDashboardInsights(
  projects: InsightProject[],
  knowledgeItems: InsightKnowledgeItem[],
  now: Date,
): DashboardInsights {
  const today = startOfUtcDay(now);
  const projectNameById = new Map(projects.map((project) => [project.id, project.name]));

  // Archived projects and finished work (100%) no longer need attention.
  const open = projects
    .filter((project) => project.status !== 'Archived' && project.progress < 100)
    .map((project) => projectState(project, today));

  const projectRisks = open
    .filter((state) => state.isOverdue || state.isDelayed || state.isHighRisk)
    .map((state) => projectRisk(state));
  const recordedRisks = knowledgeItems
    .filter((item) => item.type === 'risk')
    .map((item) => knowledgeRisk(item, projectNameById));
  const risks = [...projectRisks, ...recordedRisks].sort(compareRisks);

  const recentDecisions = knowledgeItems
    .filter(
      (item) =>
        item.type === 'decision' &&
        item.createdAt &&
        daysBetween(startOfUtcDay(item.createdAt), today) < RECENT_DECISION_DAYS,
    )
    .sort((a, b) => time(b.createdAt) - time(a.createdAt));

  return {
    summary: {
      openRisks: risks.length,
      overdueProjects: open.filter((state) => state.isOverdue).length,
      dueSoonProjects: open.filter((state) => state.isDueSoon).length,
      recentDecisions: recentDecisions.length,
    },
    risks: risks.slice(0, MAX_RISKS).map(withoutSortTime),
    priorities: priorities(open, recentDecisions, projectNameById, today),
    generatedAt: now.toISOString(),
  };
}

function priorities(
  open: ProjectState[],
  decisions: InsightKnowledgeItem[],
  projectNameById: Map<string, string>,
  today: Date,
): DashboardPriority[] {
  const overdue = open
    .filter((state) => state.isOverdue)
    .sort((a, b) => (a.daysUntilDue ?? 0) - (b.daysUntilDue ?? 0))
    .map((state) => projectPriority('overdue_project', state, -(state.daysUntilDue ?? 0)));

  const atRisk = open
    .filter((state) => !state.isOverdue && (state.isDelayed || state.isHighRisk))
    .sort(
      (a, b) =>
        Number(b.isHighRisk) - Number(a.isHighRisk) ||
        (a.daysUntilDue ?? Infinity) - (b.daysUntilDue ?? Infinity),
    )
    .map((state) => projectPriority('at_risk_project', state, null));

  const dueSoon = open
    .filter((state) => state.isDueSoon && !state.isDelayed && !state.isHighRisk)
    .sort((a, b) => (a.daysUntilDue ?? 0) - (b.daysUntilDue ?? 0))
    .map((state) => projectPriority('due_soon_project', state, state.daysUntilDue));

  const decided = decisions.map((item): DashboardPriority => ({
    kind: 'recent_decision',
    entityId: item.id,
    title: item.title,
    projectName: item.projectId ? (projectNameById.get(item.projectId) ?? null) : null,
    ownerName: null,
    dueDate: null,
    reasons: [],
    days: item.createdAt ? daysBetween(startOfUtcDay(item.createdAt), today) : null,
  }));

  return [...overdue, ...atRisk, ...dueSoon, ...decided].slice(0, MAX_PRIORITIES);
}

function projectState(project: InsightProject, today: Date): ProjectState {
  const daysUntilDue = project.dueDate ? daysBetween(today, startOfUtcDay(project.dueDate)) : null;
  return {
    project,
    daysUntilDue,
    isOverdue: daysUntilDue !== null && daysUntilDue < 0,
    isDueSoon: daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= DUE_SOON_DAYS,
    isDelayed: project.status === 'Delayed',
    isHighRisk: project.riskLevel === 'High',
  };
}

type SortableRisk = DashboardRisk & { sortTime: number };

function withoutSortTime(risk: SortableRisk): DashboardRisk {
  const copy: Partial<SortableRisk> = { ...risk };
  delete copy.sortTime;
  return copy as DashboardRisk;
}

function riskReasons(state: ProjectState) {
  const reasons: RiskReason[] = [];
  if (state.isOverdue) reasons.push('overdue');
  if (state.isDelayed) reasons.push('delayed');
  if (state.isHighRisk) reasons.push('high_risk');
  return reasons;
}

function projectRisk(state: ProjectState): SortableRisk {
  const { project } = state;
  return {
    source: 'project',
    entityId: project.id,
    title: project.name,
    severity: state.isOverdue || state.isHighRisk ? 'High' : 'Medium',
    reasons: riskReasons(state),
    detail: truncate(project.description),
    projectName: project.name,
    ownerName: project.ownerName,
    dueDate: project.dueDate?.toISOString() ?? null,
    daysOverdue: state.isOverdue ? -(state.daysUntilDue ?? 0) : null,
    sortTime: time(project.updatedAt),
  };
}

function knowledgeRisk(
  item: InsightKnowledgeItem,
  projectNameById: Map<string, string>,
): SortableRisk {
  return {
    source: 'knowledge',
    entityId: item.id,
    title: item.title,
    severity: null,
    reasons: [],
    detail: truncate(item.aiSummary || item.content),
    projectName: item.projectId ? (projectNameById.get(item.projectId) ?? null) : null,
    ownerName: null,
    dueDate: null,
    daysOverdue: null,
    sortTime: time(item.updatedAt),
  };
}

function projectPriority(
  kind: PriorityKind,
  state: ProjectState,
  days: number | null,
): DashboardPriority {
  return {
    kind,
    entityId: state.project.id,
    title: state.project.name,
    projectName: state.project.name,
    ownerName: state.project.ownerName,
    dueDate: state.project.dueDate?.toISOString() ?? null,
    reasons: riskReasons(state),
    days,
  };
}

const severityRank = { High: 0, Medium: 1 } as const;

/** High before Medium before recorded risks; then most overdue; then most recently changed. */
function compareRisks(a: SortableRisk, b: SortableRisk) {
  const rankA = a.severity ? severityRank[a.severity] : 2;
  const rankB = b.severity ? severityRank[b.severity] : 2;
  return rankA - rankB || (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0) || b.sortTime - a.sortTime;
}

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function time(date: Date | null) {
  return date?.getTime() ?? 0;
}

function truncate(text: string) {
  const clean = text.trim().replace(/\s+/g, ' ');
  return clean.length > DETAIL_LENGTH ? `${clean.slice(0, DETAIL_LENGTH - 1).trimEnd()}…` : clean;
}
