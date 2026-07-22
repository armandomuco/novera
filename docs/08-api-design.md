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
- `POST /auth/password-reset/request`: send reset email. Public, rate limited.
- `POST /auth/password-reset/confirm`: set new password. Public with reset token.
- `POST /auth/email/verify`: verify email. Public with verification token.
- `GET /auth/status`: returns auth module health. Public for MVP scaffolding.

## Organizations

- `POST /organizations`: create organization. Authenticated.
- `GET /organizations`: list memberships. Authenticated.
- `GET /organizations/:organizationId`: get organization. Member.
- `PATCH /organizations/:organizationId`: update settings. Administrator+.
- `POST /organizations/:organizationId/invitations`: invite member. Administrator+.
- `POST /organizations/:organizationId/switch`: set active org context. Member.
- `GET /organizations/status`: returns organization module health. Public for MVP scaffolding.

## Projects

- `POST /organizations/:organizationId/projects`: create project. Manager+.
- `GET /organizations/:organizationId/projects`: paginated list. Member with permission.
- `GET /organizations/:organizationId/projects/:projectId`: project detail. Project member or org role.
- `PATCH /organizations/:organizationId/projects/:projectId`: update project. Manager+.
- `POST /organizations/:organizationId/projects/:projectId/archive`: archive. Manager+.
- `POST /organizations/:organizationId/projects/:projectId/members`: assign member. Manager+.

## Knowledge Items

- `POST /organizations/:organizationId/knowledge-items`: create item. Member+.
- `GET /organizations/:organizationId/knowledge-items`: search/filter list. Member+.
- `GET /organizations/:organizationId/knowledge-items/:id`: retrieve item. Authorized source access.
- `PATCH /organizations/:organizationId/knowledge-items/:id`: update item. Creator, Manager+.
- `DELETE /organizations/:organizationId/knowledge-items/:id`: soft delete. Creator, Manager+.

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

- `GET /organizations/:organizationId/activity`: timeline. Member+. Filters by eventType, entityType, projectId, dateRange.

## Integrations

- `GET /organizations/:organizationId/integrations`: catalog and connection status. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/connect`: future OAuth start. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/disconnect`: disconnect. Administrator+.
