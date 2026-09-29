import { demoUsers, risks } from '../data/demoWorkspace';
import { authenticatedFetch, getStoredAuth } from './authApi';
import { WorkspaceData } from './demoApi';

type ApiResponse<T> = {
  data: T;
};

type ApiOrganization = {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  settings?: {
    aiProvider?: string;
  };
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

type ApiDocument = {
  id: string;
  title: string;
  type: string;
  status: string;
  projectId: string | null;
  updatedAt: string | null;
  processingError: string | null;
  chunkCount: number;
};

export type DocumentSearchResult = {
  documentId: string;
  title: string;
  type: string;
  projectId: string | null;
  chunkIndex: number;
  excerpt: string;
  score: number | null;
  sourceUrl: string;
};

type ApiMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type ApiInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  previewUrl?: string;
  delivery?: string;
};

type ApiOrganizationMembership = ApiOrganization & { role: string };

export function hasAuthenticatedSession() {
  return Boolean(getStoredAuth());
}

export async function fetchProductionWorkspace(): Promise<WorkspaceData> {
  const [me, organizations, projects, knowledgeItems, documents, activityEvents] =
    await Promise.all([
      get<ApiResponse<{ organization: ApiOrganization }>>('/api/v1/auth/me'),
      get<ApiResponse<ApiOrganizationMembership[]>>('/api/v1/organizations'),
      get<ApiResponse<ApiProject[]>>('/api/v1/projects'),
      get<ApiResponse<ApiKnowledgeItem[]>>('/api/v1/knowledge-items'),
      get<ApiResponse<ApiDocument[]>>('/api/v1/documents'),
      get<ApiResponse<ApiActivity[]>>('/api/v1/activity'),
    ]);
  const [members, invitations] = await Promise.all([
    get<ApiResponse<ApiMember[]>>(`/api/v1/organizations/${me.data.organization.id}/members`),
    get<ApiResponse<ApiInvitation[]>>(
      `/api/v1/organizations/${me.data.organization.id}/invitations`,
    ),
  ]);
  const auth = getStoredAuth();
  const projectNameById = new Map(projects.data.map((project) => [project.id, project.name]));

  return {
    organization: {
      id: me.data.organization.id,
      name: me.data.organization.name,
      slug: me.data.organization.slug,
      industry: me.data.organization.industry ?? 'Knowledge business',
    },
    organizations: organizations.data,
    users: members.data.length ? members.data : auth?.user ? [auth.user] : demoUsers.slice(0, 1),
    invitations: invitations.data,
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
      project: item.projectId
        ? (projectNameById.get(item.projectId) ?? 'Unassigned')
        : 'Unassigned',
    })),
    documents: documents.data.map((document) => ({
      id: document.id,
      title: document.title,
      type: document.type,
      status: document.status,
      project: document.projectId
        ? (projectNameById.get(document.projectId) ?? 'Unassigned')
        : 'Unassigned',
      updated: document.updatedAt ? new Date(document.updatedAt).toLocaleString() : 'Recently',
      processingError: document.processingError,
      chunkCount: document.chunkCount,
    })),
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

export async function createProductionInvitation(input: {
  organizationId: string;
  email: string;
  role: string;
}): Promise<{ workspace: WorkspaceData; invitation: ApiInvitation }> {
  const invitation = await mutation<ApiInvitation>(
    `/api/v1/organizations/${input.organizationId}/invitations`,
    {
      email: input.email,
      role: input.role,
      expiresInDays: 7,
    },
  );
  const workspace = await fetchProductionWorkspace();
  workspace.invitations = (workspace.invitations ?? []).map((item) =>
    item.id === invitation.id ? { ...item, ...invitation } : item,
  );
  return { workspace, invitation };
}

export async function cancelProductionInvitation(input: {
  organizationId: string;
  invitationId: string;
}): Promise<WorkspaceData> {
  const response = await authenticatedFetch(
    `/api/v1/organizations/${input.organizationId}/invitations/${input.invitationId}`,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    throw new Error(`Invitation cancellation failed: ${response.status}`);
  }
  return fetchProductionWorkspace();
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

export async function updateProductionProject(
  projectId: string,
  input: { name: string; owner: string; summary: string },
): Promise<WorkspaceData> {
  await requestMutation(`/api/v1/projects/${projectId}`, 'PATCH', {
    name: input.name,
    ownerName: input.owner,
    description: input.summary,
  });
  return fetchProductionWorkspace();
}

export async function archiveProductionProject(projectId: string): Promise<WorkspaceData> {
  await requestMutation(`/api/v1/projects/${projectId}`, 'DELETE');
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

export async function updateProductionKnowledgeItem(
  itemId: string,
  input: { title: string; type: string; summary: string },
): Promise<WorkspaceData> {
  await requestMutation(`/api/v1/knowledge-items/${itemId}`, 'PATCH', {
    title: input.title,
    type: normalizeKnowledgeType(input.type),
    content: input.summary,
  });
  return fetchProductionWorkspace();
}

export async function archiveProductionKnowledgeItem(itemId: string): Promise<WorkspaceData> {
  await requestMutation(`/api/v1/knowledge-items/${itemId}`, 'DELETE');
  return fetchProductionWorkspace();
}

export async function uploadProductionDocument(input: {
  title: string;
  file: File;
}): Promise<WorkspaceData> {
  const formData = new FormData();
  formData.set('title', input.title);
  formData.set('file', input.file);
  const response = await authenticatedFetch('/api/v1/documents/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Document upload failed: ${response.status}`);
  }
  return fetchProductionWorkspace();
}

export async function downloadProductionDocument(documentId: string, fileName: string) {
  const response = await authenticatedFetch(`/api/v1/documents/${documentId}/download`);
  if (!response.ok) {
    throw new Error(`Document download failed: ${response.status}`);
  }
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export async function searchProductionDocuments(query: string) {
  const response = await get<ApiResponse<DocumentSearchResult[]>>(
    `/api/v1/documents/search?query=${encodeURIComponent(query)}`,
  );
  return response.data;
}

export async function reprocessProductionDocument(documentId: string): Promise<WorkspaceData> {
  const response = await authenticatedFetch(`/api/v1/documents/${documentId}/reprocess`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Document reprocessing failed: ${response.status}`);
  }
  return fetchProductionWorkspace();
}

export async function updateProductionOrganization(input: {
  organizationId: string;
  name: string;
  industry: string;
  aiProvider: string;
}): Promise<WorkspaceData> {
  await authenticatedFetch(`/api/v1/organizations/${input.organizationId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name,
      industry: input.industry,
      aiProvider: input.aiProvider,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Organization update failed: ${response.status}`);
    }
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

async function mutation<T = void>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await authenticatedFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Mutation failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

async function requestMutation(
  path: string,
  method: 'PATCH' | 'DELETE',
  body?: Record<string, unknown>,
) {
  const response = await authenticatedFetch(path, {
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
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
