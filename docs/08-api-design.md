# API Design

Base path: `/api/v1`.

## Response Format

```json
{
  "data": {},
  "meta": {},
  "requestId": "req_123"
}
```

## Error Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  },
  "requestId": "req_123"
}
```

## Auth

- `POST /auth/register`: create account. Public. Validates email, password, name.
- `POST /auth/login`: create access and refresh tokens. Public. Rate limited.
- `POST /auth/logout`: revoke active session. Authenticated.
- `POST /auth/refresh`: rotate refresh token. Public with valid refresh token.
- `GET /auth/me`: return the authenticated user and active organization from the bearer access token.
- `POST /auth/password-reset/request`: send reset email. Public, rate limited.
- `POST /auth/password-reset/confirm`: set new password. Public with reset token.
- `POST /auth/email/verify`: verify email. Public with verification token.
- `GET /auth/status`: returns auth module health. Public for MVP scaffolding.

Current implementation note: register, login, refresh, logout, and me are implemented with MongoDB-backed users, organizations, organization memberships, sessions, scrypt password hashing, HMAC-signed JWT-compatible tokens, refresh-token rotation, and hashed refresh-token storage. Fresh access tokens are accepted by protected production routes after membership and tenant validation. Password reset and email verification remain planned.

## Organizations

- `POST /organizations`: create organization. Authenticated. Planned after initial owner organization creation.
- `GET /organizations`: list memberships. Authenticated. Implemented.
- `GET /organizations/:organizationId`: get organization. Member. Implemented with membership validation.
- `PATCH /organizations/:organizationId`: update settings. Administrator+.
- `POST /organizations/:organizationId/invitations`: invite member. Administrator+.
- `POST /organizations/:organizationId/switch`: set active org context. Member.
- `GET /organizations/status`: returns organization module health. Public for MVP scaffolding.

## Projects

- `POST /projects`: create project. Owner, Administrator, or Manager. Implemented with tenant validation.
- `GET /projects`: paginated list. Member with permission. Implemented with active organization default and optional organization filter.
- `GET /projects/:projectId`: project detail. Implemented with project organization membership validation.
- `PATCH /projects/:projectId`: update project. Owner, Administrator, or Manager. Implemented.
- `DELETE /projects/:projectId`: archive. Owner, Administrator, or Manager. Implemented as soft deletion.
- `POST /organizations/:organizationId/projects/:projectId/members`: assign member. Manager+.

## Knowledge Items

- `POST /knowledge-items`: create item. Member+. Implemented with tenant validation and optional project validation.
- `GET /knowledge-items`: list/filter items. Member+. Implemented with organization, project, and type filters.
- `GET /knowledge-items/:itemId`: retrieve item. Implemented with tenant validation.
- `PATCH /knowledge-items/:itemId`: update item. Member+. Implemented with soft re-embedding status reset when content changes.
- `DELETE /knowledge-items/:itemId`: soft delete. Member+. Implemented as archive.

## Documents

- `POST /organizations/:organizationId/documents`: upload. Member+. Validates type and size.
- `GET /organizations/:organizationId/documents`: paginated list. Member+.
- `GET /organizations/:organizationId/documents/:id`: metadata. Authorized access.
- `GET /organizations/:organizationId/documents/:id/download`: signed URL. Authorized access.
- `POST /organizations/:organizationId/documents/:id/reprocess`: queue processing. Manager+.

## AI Assistant

- `POST /organizations/:organizationId/ai/conversations`: create conversation. Member+.
- `POST /organizations/:organizationId/ai/conversations/:id/messages`: ask question. Member+. Retrieves only authorized sources.
- `GET /organizations/:organizationId/ai/conversations`: list conversations. Member+.

## Search

- `POST /organizations/:organizationId/search`: hybrid search. Member+. Supports query, projectIds, types, tags, dateRange, pagination.

## Activity

- `GET /activity`: timeline. Member+. Implemented with active organization default and optional organization filter.

Current implementation note: project create/update/archive and knowledge create/update/archive record activity events.

## Demo

These endpoints support the current local MVP demo while the production authentication and tenant modules are being built.

- `GET /demo/workspace`: returns the seeded Acme Studio workspace from MongoDB. Public in local demo only.
- `POST /demo/login`: returns a seeded demo user by email. Public in local demo only.
- `PATCH /demo/profile`: updates a seeded demo user's display name. Public in local demo only.
- `POST /demo/projects`: creates a demo project and records activity. Public in local demo only.
- `POST /demo/knowledge-items`: creates a demo knowledge item and records activity. Public in local demo only.
- `POST /demo/documents`: creates demo document metadata and records activity. Public in local demo only.

These endpoints must be replaced by authenticated, tenant-checked production endpoints before a real launch.

Frontend usage note: demo users with `@novera.test` still use these seeded demo endpoints. Non-demo users use the production `auth/me`, `projects`, `knowledge-items`, and `activity` endpoints for workspace loading and creation.

## Integrations

- `GET /organizations/:organizationId/integrations`: catalog and connection status. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/connect`: future OAuth start. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/disconnect`: disconnect. Administrator+.
