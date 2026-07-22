import {
  activities,
  demoUsers,
  documents,
  knowledgeItems,
  projects,
  risks,
} from '../data/demoWorkspace';

export type ApiUser = {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  focus?: string;
  password?: string;
};

export type WorkspaceData = {
  organization: {
    id?: string;
    name: string;
    slug: string;
    industry?: string;
  };
  users: ApiUser[];
  projects: typeof projects;
  knowledgeItems: typeof knowledgeItems;
  documents: typeof documents;
  risks: typeof risks;
  activities: typeof activities;
  source: 'api' | 'fallback';
};

type ApiResponse<T> = {
  data: T;
};

const fallbackWorkspace: WorkspaceData = {
  organization: {
    name: 'Acme Studio',
    slug: 'acme-studio',
    industry: 'Digital agency',
  },
  users: demoUsers,
  projects,
  knowledgeItems,
  documents,
  risks,
  activities,
  source: 'fallback',
};

export async function fetchWorkspace(): Promise<WorkspaceData> {
  try {
    const response = await fetch('/api/v1/demo/workspace');
    if (!response.ok) {
      throw new Error(`Workspace request failed: ${response.status}`);
    }
    const payload = (await response.json()) as ApiResponse<Omit<WorkspaceData, 'source'>>;
    return { ...payload.data, source: 'api' };
  } catch {
    return fallbackWorkspace;
  }
}

export async function loginDemoUser(email: string, password: string): Promise<ApiUser> {
  try {
    const response = await fetch('/api/v1/demo/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    const payload = (await response.json()) as ApiResponse<ApiUser>;
    return payload.data;
  } catch {
    const fallback = demoUsers.find((user) => user.email === email && user.password === password);
    if (!fallback) {
      throw new Error('Invalid demo credentials.');
    }
    return fallback;
  }
}

export async function updateDemoProfile(email: string, name: string): Promise<ApiUser> {
  try {
    const response = await fetch('/api/v1/demo/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (!response.ok) {
      throw new Error(`Profile update failed: ${response.status}`);
    }
    const payload = (await response.json()) as ApiResponse<ApiUser>;
    return payload.data;
  } catch {
    return { ...demoUsers[0], email, name };
  }
}

export async function createDemoProject(input: {
  name: string;
  owner: string;
  summary: string;
}): Promise<WorkspaceData> {
  return mutateWorkspace('/api/v1/demo/projects', input);
}

export async function createDemoKnowledgeItem(input: {
  title: string;
  type: string;
  summary: string;
}): Promise<WorkspaceData> {
  return mutateWorkspace('/api/v1/demo/knowledge-items', input);
}

export async function createDemoDocument(input: { title: string; type: string }): Promise<WorkspaceData> {
  return mutateWorkspace('/api/v1/demo/documents', input);
}

async function mutateWorkspace(path: string, input: Record<string, string>): Promise<WorkspaceData> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Mutation failed: ${response.status}`);
    }
    const payload = (await response.json()) as ApiResponse<Omit<WorkspaceData, 'source'>>;
    return { ...payload.data, source: 'api' };
  } catch {
    return fallbackWorkspace;
  }
}
