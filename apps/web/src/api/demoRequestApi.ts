export type DemoRequestInput = {
  name: string;
  email: string;
  company: string;
  role: string;
  companySize: string;
  useCase: string;
};

type ApiResponse<T> = {
  data: T;
};

export async function requestDemo(input: DemoRequestInput) {
  const response = await fetch('/api/v1/demo-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Demo request failed: ${response.status}`);
  }
  const payload = (await response.json()) as ApiResponse<{
    id: string;
    status: string;
    supportEmail: string;
    requestedDemoExpiresAt: string;
    message: string;
  }>;
  return payload.data;
}
