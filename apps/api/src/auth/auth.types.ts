export type AuthContext = {
  userId: string;
  email: string;
  organizationId: string;
  role: string;
};

export type RequestWithAuth = {
  auth?: AuthContext;
};
