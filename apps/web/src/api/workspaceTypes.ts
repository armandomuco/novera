// Shapes the web app uses for the signed-in user and the loaded workspace.

export type ApiUser = {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  focus?: string;
  password?: string;
};

export const projectStatuses = [
  'Planning',
  'Active',
  'On track',
  'Review',
  'Delayed',
  'Archived',
] as const;
export const riskLevels = ['Low', 'Medium', 'High'] as const;

export type WorkspaceProject = {
  id: string;
  name: string;
  status: string;
  risk: string;
  owner: string;
  /** ISO timestamp of the due date (midnight UTC), or null when none is set. */
  dueDate: string | null;
  progress: number;
  summary: string;
  objectives?: string[];
};

/** The fields a project edit can change. */
export type ProjectUpdate = {
  id: string;
  name: string;
  owner: string;
  summary: string;
  status: string;
  risk: string;
  /** "YYYY-MM-DD", or empty to clear the due date. */
  dueDate: string;
  progress: number;
};

export type WorkspaceKnowledgeItem = {
  id: string;
  type: string;
  title: string;
  source: string;
  summary: string;
  project: string;
};

export type WorkspaceActivity = {
  id?: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

export type WorkspaceDocument = {
  id: string;
  title: string;
  type: string;
  status: string;
  project: string;
  updated: string;
  processingError?: string | null;
  chunkCount?: number;
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

export type DashboardPriority = {
  kind: 'overdue_project' | 'at_risk_project' | 'due_soon_project' | 'recent_decision';
  entityId: string;
  title: string;
  projectName: string | null;
  ownerName: string | null;
  dueDate: string | null;
  reasons: RiskReason[];
  /**
   * overdue_project: days past the due date; due_soon_project: days until it;
   * recent_decision: days since it was recorded; at_risk_project: null.
   */
  days: number | null;
};

/** Risks, priorities and counts the API derives from projects and knowledge items. */
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

export type WorkspaceData = {
  organization: {
    id?: string;
    name: string;
    slug: string;
    industry?: string;
  };
  organizations?: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
  users: ApiUser[];
  invitations?: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    previewUrl?: string;
    delivery?: string;
  }>;
  projects: WorkspaceProject[];
  knowledgeItems: WorkspaceKnowledgeItem[];
  documents: WorkspaceDocument[];
  /** Null when the workspace could not be loaded from the API. */
  dashboard: DashboardInsights | null;
  activities: WorkspaceActivity[];
  source: 'api' | 'fallback';
};
