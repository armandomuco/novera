// Shapes the web app uses for the signed-in user and the loaded workspace.
// Sample-data types still come from the local demo dataset until those views move to API types.
import type { activities, knowledgeItems, projects, risks } from '../data/demoWorkspace';

export type ApiUser = {
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  focus?: string;
  password?: string;
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
  projects: typeof projects;
  knowledgeItems: typeof knowledgeItems;
  documents: WorkspaceDocument[];
  risks: typeof risks;
  activities: typeof activities;
  source: 'api' | 'fallback';
};
