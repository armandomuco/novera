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

export function persistAuth(payload: AuthPayload) {
  window.localStorage.setItem('novera-auth', JSON.stringify(payload));
  window.localStorage.setItem('novera-demo-user', JSON.stringify(payload.user));
}

export function clearAuth() {
  window.localStorage.removeItem('novera-auth');
}
