import { ApiUser } from './demoApi';

export type AuthPayload = {
  user: ApiUser;
  organizationId: string;
  accessToken: string;
  refreshToken: string;
  verificationPreviewUrl?: string;
};

type ApiResponse<T> = {
  data: T;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
};

export type InvitationDetails = {
  email: string;
  role: string;
  organization: { id: string; name: string };
  expiresAt: string;
  accountExists: boolean;
};

export async function registerUser(input: RegisterInput): Promise<AuthPayload> {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Register failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<AuthPayload>;
  persistAuth(payload.data);
  return payload.data;
}

export async function loginUser(email: string, password: string): Promise<AuthPayload> {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<AuthPayload>;
  persistAuth(payload.data);
  return payload.data;
}

export async function requestPasswordReset(email: string) {
  const response = await fetch('/api/v1/auth/password-reset/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    throw new Error(`Password reset request failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<{
    accepted: boolean;
    message: string;
    previewUrl?: string;
  }>;
  return payload.data;
}

export async function completePasswordReset(token: string, password: string) {
  const response = await fetch('/api/v1/auth/password-reset/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  if (!response.ok) {
    throw new Error(`Password reset failed: ${response.status}`);
  }
}

export async function verifyEmail(token: string) {
  const response = await fetch('/api/v1/auth/email-verification/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error(`Email verification failed: ${response.status}`);
  }
}

export async function requestEmailVerification() {
  const response = await authenticatedFetch('/api/v1/auth/email-verification/request', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Email verification request failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<{
    accepted: boolean;
    alreadyVerified?: boolean;
    previewUrl?: string;
  }>;
  return payload.data;
}

export async function getInvitationDetails(token: string): Promise<InvitationDetails> {
  const response = await fetch(`/api/v1/auth/invitations/${encodeURIComponent(token)}`);
  if (!response.ok) {
    throw new Error(`Invitation lookup failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<InvitationDetails>;
  return payload.data;
}

export async function acceptInvitation(input: {
  token: string;
  name?: string;
  password: string;
}): Promise<AuthPayload> {
  const response = await fetch('/api/v1/auth/invitations/accept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Invitation acceptance failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<AuthPayload>;
  persistAuth(payload.data);
  return payload.data;
}

export async function switchOrganization(organizationId: string): Promise<AuthPayload> {
  const response = await authenticatedFetch('/api/v1/auth/switch-organization', {
    method: 'POST',
    body: JSON.stringify({ organizationId }),
  });
  if (!response.ok) {
    throw new Error(`Organization switch failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<AuthPayload>;
  persistAuth(payload.data);
  return payload.data;
}

export async function updateCurrentUser(input: { name: string }): Promise<ApiUser> {
  const response = await authenticatedFetch('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Profile update failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<ApiUser>;
  const auth = getStoredAuth();
  if (auth) {
    persistAuth({ ...auth, user: payload.data });
  }
  return payload.data;
}

export function persistAuth(payload: AuthPayload) {
  window.localStorage.setItem('novera-auth', JSON.stringify(payload));
  window.localStorage.setItem('novera-demo-user', JSON.stringify(payload.user));
}

export function clearAuth() {
  window.localStorage.removeItem('novera-auth');
}

export function getStoredAuth(): AuthPayload | null {
  try {
    const stored = window.localStorage.getItem('novera-auth');
    return stored ? (JSON.parse(stored) as AuthPayload) : null;
  } catch {
    return null;
  }
}

export async function authenticatedFetch(path: string, options: RequestInit = {}) {
  const auth = getStoredAuth();
  if (!auth) {
    throw new Error('Missing authenticated session.');
  }
  const response = await fetch(path, withAuthHeaders(options, auth.accessToken));
  if (response.status !== 401) {
    return response;
  }

  const refreshResponse = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: auth.refreshToken }),
  });
  if (!refreshResponse.ok) {
    clearAuth();
    throw new Error('Session expired.');
  }
  const payload = (await refreshResponse.json()) as ApiResponse<
    Pick<AuthPayload, 'accessToken' | 'refreshToken'>
  >;
  const nextAuth = { ...auth, ...payload.data };
  persistAuth(nextAuth);
  return fetch(path, withAuthHeaders(options, nextAuth.accessToken));
}

function withAuthHeaders(options: RequestInit, accessToken: string): RequestInit {
  const hasFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
  return {
    ...options,
    headers: {
      ...(options.body && !hasFormDataBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  };
}
