import { ApiUser } from './demoApi';

type AuthPayload = {
  user: ApiUser;
  organizationId: string;
  accessToken: string;
  refreshToken: string;
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
  const payload = (await refreshResponse.json()) as ApiResponse<Pick<AuthPayload, 'accessToken' | 'refreshToken'>>;
  const nextAuth = { ...auth, ...payload.data };
  persistAuth(nextAuth);
  return fetch(path, withAuthHeaders(options, nextAuth.accessToken));
}

function withAuthHeaders(options: RequestInit, accessToken: string): RequestInit {
  return {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  };
}
