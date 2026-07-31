import { demoUsers, documents, risks } from '../data/demoWorkspace';
import { authenticatedFetch, getStoredAuth } from './authApi';
import { WorkspaceData } from './demoApi';

type ApiResponse<T> = {
  data: T;
};

type ApiOrganization = {
  id: string;
  name: string;
  slug: string;
};

type ApiProject = {
  id: string;
  name: string;
  status: string;
  riskLevel: string;
  ownerName: string | null;
  dueDate: string | null;
  progress: number;
  description: string;
  objectives: string[];
};

type ApiKnowledgeItem = {
  id: string;
  title: string;
  type: string;
  source: string;
  content: string;
  aiSummary: string;
  projectId: string | null;
  tags: string[];
};

type ApiActivity = {
  id: string;
  actorName: string | null;
  eventType: string;
  entityName: string;
  createdAt: string | null;
};

export function hasProductionSession() {
  const auth = getStoredAuth();
  return Boolean(auth && !auth.user.email.endsWith('@novera.test'));
}

export async function fetchProductionWorkspace(): Promise<WorkspaceData> {
  const [me, projects, knowledgeItems, activityEvents] = await Promise.all([
    get<ApiResponse<{ organization: ApiOrganization }>>('/api/v1/auth/me'),
    get<ApiResponse<ApiProject[]>>('/api/v1/projects'),
    get<ApiResponse<ApiKnowledgeItem[]>>('/api/v1/knowledge-items'),
    get<ApiResponse<ApiActivity[]>>('/api/v1/activity'),
  ]);
  const auth = getStoredAuth();
  const projectNameById = new Map(projects.data.map((project) => [project.id, project.name]));

  return {
    organization: {
      id: me.data.organization.id,
      name: me.data.organization.name,
      slug: me.data.organization.slug,
      industry: 'Knowledge business',
    },
    users: auth?.user ? [auth.user] : demoUsers.slice(0, 1),
    projects: projects.data.map((project) => ({
      id: project.id,
      name: project.name,
      status: project.status,
      risk: project.riskLevel,
      owner: project.ownerName ?? auth?.user.name ?? 'Unassigned',
      due: project.dueDate ?? 'No due date',
      progress: project.progress,
      summary: project.description,
      objectives: project.objectives,
    })),
    knowledgeItems: knowledgeItems.data.map((item) => ({
      id: item.id,
      type: formatType(item.type),
      title: item.title,
      source: item.source,
      summary: item.aiSummary || item.content,
      project: item.projectId ? (projectNameById.get(item.projectId) ?? 'Unassigned') : 'Unassigned',
    })),
    documents: documents.slice(0, 0),
    risks: risks.slice(0, 0),
    activities: activityEvents.data.map((event) => ({
      id: event.id,
      actor: event.actorName ?? 'System',
      action: formatType(event.eventType),
      target: event.entityName,
      time: event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Recently',
    })),
    source: 'api',
  };
}

export async function createProductionProject(input: {
  name: string;
  owner: string;
  summary: string;
}): Promise<WorkspaceData> {
  await mutation('/api/v1/projects', {
    name: input.name,
    ownerName: input.owner,
    description: input.summary,
    status: 'Active',
    riskLevel: 'Medium',
  });
  return fetchProductionWorkspace();
}

export async function createProductionKnowledgeItem(input: {
  title: string;
  type: string;
  summary: string;
}): Promise<WorkspaceData> {
  await mutation('/api/v1/knowledge-items', {
    title: input.title,
    type: normalizeKnowledgeType(input.type),
    source: 'Workspace entry',
    content: input.summary,
    tags: ['manual'],
  });
  return fetchProductionWorkspace();
}

async function get<T>(path: string): Promise<T> {
  const response = await authenticatedFetch(path);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function mutation(path: string, body: Record<string, unknown>) {
  const response = await authenticatedFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Mutation failed: ${response.status}`);
  }
}

function normalizeKnowledgeType(type: string) {
  const normalized = type.toLowerCase().replace(/\s+/g, '_');
  return normalized === 'meeting' ? 'meeting_summary' : normalized;
}

function formatType(value: string) {
  return value
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
