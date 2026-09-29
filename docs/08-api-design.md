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
- `PATCH /auth/me`: update the authenticated user's profile.
- `GET /auth/invitations/:token`: validate a single-use invitation and return its public workspace details.
- `POST /auth/invitations/accept`: accept as an existing user or create the invited account, then issue a tenant-scoped session.
- `POST /auth/switch-organization`: validate membership, create a session for the selected organization, and revoke the previous session.
- `POST /auth/password-reset/request`: create a one-hour, single-use reset token without revealing whether the email exists. Public; production rate limiting remains required.
- `POST /auth/password-reset/complete`: consume a reset token, hash the new password, and revoke every active session for the user.
- `POST /auth/email-verification/request`: create a new 24-hour verification token for the authenticated user.
- `POST /auth/email-verification/verify`: consume a verification token and mark the email verified.
- `GET /auth/status`: returns auth module health. Public for MVP scaffolding.

Current implementation note: register, login, refresh, logout, me, invitation acceptance, organization switching, email verification, and password reset are implemented with MongoDB-backed users, memberships, sessions, and hashed action tokens. JWT signing and verification use `jsonwebtoken` with HS256 and environment-specific secrets. Development responses may include a local preview link; production email delivery remains separate.

## Organizations

- `POST /organizations`: create organization. Authenticated. Planned after initial owner organization creation.
- `GET /organizations`: list memberships. Authenticated. Implemented.
- `GET /organizations/:organizationId`: get organization. Member. Implemented with membership validation.
- `PATCH /organizations/:organizationId`: update settings. Administrator+.
- `GET /organizations/:organizationId/members`: list active organization members. Member+. Implemented.
- `GET /organizations/:organizationId/invitations`: list pending invitations. Member+. Implemented.
- `POST /organizations/:organizationId/invitations`: invite member. Owner, Administrator, or Manager. Implemented with duplicate prevention, role validation, expiry, activity recording, and a development-only preview link.
- `DELETE /organizations/:organizationId/invitations/:invitationId`: cancel pending invitation. Owner, Administrator, or Manager. Implemented.
- `GET /organizations/status`: returns organization module health. Public for MVP scaffolding.

Current implementation note: invitation creation, cancellation, inspection, expiry, and acceptance are implemented. Production email delivery remains planned.

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

- `POST /documents/upload`: multipart upload for PDF, DOCX, TXT, and Markdown. Member+. Implemented with tenant validation, configurable size limits, extension/signature checks, SHA-256 checksum, malware-scanning hook, and S3-compatible storage.
- `GET /documents/:documentId/download`: authenticated file download after document-level tenant membership validation. Implemented.
- `GET /documents`: list tenant document metadata and processing state. Implemented.
- `GET /documents/search?query=...&projectId=...`: tenant-scoped full-text search over extracted chunks with source excerpts. Implemented.
- `POST /documents/:documentId/reprocess`: requeue an authorized stored file after a processing failure. Member+. Implemented.

Current implementation note: TXT and Markdown are extracted synchronously. PDF and DOCX files are processed by a BullMQ worker with retries and failure state, and all extracted text is normalized, summarized locally, and split into tenant-scoped chunks. Vector embeddings, model-generated summaries, and a production malware scanner remain planned.

## AI Assistant

- `POST /organizations/:organizationId/ai/conversations`: create conversation. Member+.
- `POST /organizations/:organizationId/ai/conversations/:id/messages`: ask question. Member+. Retrieves only authorized sources.
- `GET /organizations/:organizationId/ai/conversations`: list conversations. Member+.

## Search

- `POST /organizations/:organizationId/search`: hybrid search. Member+. Supports query, projectIds, types, tags, dateRange, pagination.

Current implementation note: keyword search over document chunks is available through `GET /documents/search`. Unified metadata filters and semantic/vector ranking remain planned.

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

These endpoints remain available for local fixture tooling, but the frontend now sends seeded and newly registered users through the same authenticated, tenant-checked production endpoints.

## Integrations

- `GET /organizations/:organizationId/integrations`: catalog and connection status. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/connect`: future OAuth start. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/disconnect`: disconnect. Administrator+.
