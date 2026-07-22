export type OrganizationRole = 'Owner' | 'Administrator' | 'Manager' | 'Member' | 'Viewer';

export type KnowledgeItemType =
  | 'document'
  | 'note'
  | 'decision'
  | 'meeting_summary'
  | 'link'
  | 'project_update'
  | 'customer_information'
  | 'process'
  | 'risk';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
  requestId?: string;
}
