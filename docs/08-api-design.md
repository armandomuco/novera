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
- `PATCH /projects/:projectId`: update project. Owner, Administrator, or Manager. Implemented. Accepts `name`, `description`, `status`, `riskLevel`, `ownerName`, `dueDate` (ISO date, or `null` to clear it), `progress` (integer 0-100), and `objectives`.
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

## Assistant

- `POST /assistant/ask`: answers a question from the active organization's documents, knowledge items, and projects. Any active member. Body: `question` (2-1000 characters), optional `projectId` (must belong to the active organization), optional `language` (`en`, `sq`, `it`, `de`, `fr`). Returns `answer` (null when no record matches), `confidence` (`high`, `medium`, `low`, `none`), cited `sources` with ids matching the `[S1]` markers in the answer, `missingTerms`, `provider`, `model`, `promptVersion`, and `interactionId`. Limited to 20 requests per minute.

## Dashboard

- `GET /dashboard`: risks, priorities, and counts for the active organization. Any active member. Nothing is stored; the response is derived on each request from projects and knowledge items:
  - `risks`: open projects (not archived, progress below 100) that are overdue, `Delayed`, or `High` risk, plus knowledge items of type `risk`. Overdue or high-risk projects are `High` severity, delayed ones `Medium`; knowledge-item risks have no severity. A risk is closed by changing the project or archiving the knowledge item. At most 10 are returned; `summary.openRisks` has the full count.
  - `priorities` (at most 6, in this order): overdue projects (most overdue first), delayed or high-risk projects, projects due within 7 days, and decisions recorded in the last 14 days.
  - `summary`: `openRisks`, `overdueProjects`, `dueSoonProjects`, `recentDecisions`.
  - Dates are compared by UTC calendar day; a project due today is not overdue.

## Demo Workspace

There are no separate demo endpoints. `npm run seed:demo` writes the Acme Studio organization, members, and sample records into MongoDB, and the seeded `@novera.test` users sign in through the normal `/auth` endpoints with the same tenant and role checks as every other account.

## Rate Limiting

Every route is limited to 120 requests per minute per client IP. Unauthenticated endpoints that check credentials, consume tokens, or create records (`register`, `login`, password reset, email verification, invitation lookup and acceptance, and demo requests) are limited to 10 requests per minute. Limited requests return HTTP 429. Set `TRUST_PROXY_HOPS` when the API runs behind a load balancer so limits apply to the real client IP.

## Integrations

- `GET /organizations/:organizationId/integrations`: catalog and connection status. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/connect`: future OAuth start. Administrator+.
- `POST /organizations/:organizationId/integrations/:provider/disconnect`: disconnect. Administrator+.
