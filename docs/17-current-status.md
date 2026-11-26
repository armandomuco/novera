# Current Project Status

Last updated: 2026-09-29.

## Done

- Product definition, market positioning, MVP scope, brand direction, architecture, API, database, AI, security, testing, deployment, roadmap, risks, and project-management docs.
- Novera working name, SVG logo, public landing page, pricing page, demo-request page, login, signup, and authenticated app shell.
- Monorepo foundation with NestJS API, React/Vite web app, shared packages, Docker Compose, linting, formatting, strict TypeScript, and starter tests.
- Local helper scripts for starting, stopping, checking status, full shutdown, Node version checking, and demo seeding.
- `.env.example` for shared defaults and local `.env` support ignored by git.
- MongoDB-backed authentication foundation: registration, login, access tokens, refresh-token rotation, logout, current-user lookup, profile update, scrypt password hashing, sessions, and owner organization creation.
- Email verification and password reset with hashed, expiring, single-use action tokens, local preview links, translated screens, and full session revocation after password changes.
- JWT signing and verification through the audited `jsonwebtoken` library with an explicit HS256 algorithm allow-list.
- Tenant-aware organization membership validation.
- Organization profile/settings update.
- Project CRUD foundation with soft archive and activity events.
- Knowledge item CRUD foundation with soft archive and activity events.
- Document metadata creation/listing plus real multipart uploads and authenticated downloads.
- S3-compatible object storage with tenant-prefixed keys, file size/type/signature validation, SHA-256 checksums, and malware-scanning hook.
- Immediate TXT/Markdown extraction plus BullMQ/Redis background extraction for PDF and DOCX with retries and failure recovery.
- Normalized, overlapping, tenant-scoped document chunks and deterministic local summaries.
- Authorized MongoDB keyword search over document content with source excerpts and download links.
- Document processing UI with automatic status refresh, indexed-section counts, errors, and retry controls.
- Production dependency audit reports zero known vulnerabilities (2026-11-26): mongoose 8.24.11 (one copy, enforced by a root override), Multer override 2.5.0, Zod 4, @nestjs/swagger 11.4.8, Vite 8.4. Eight moderate advisories remain in development-only tooling (`@nestjs/cli` 11 and `@typescript-eslint` 7 via glob/minimatch) and need major tooling upgrades.
- Seeded demo projects include progress values, and the API reports 0 for project records stored without one.
- Dashboard on production data (`GET /api/v1/dashboard`): risks from overdue, delayed, and high-risk projects plus knowledge items of type risk; priorities from overdue, at-risk, and due-soon projects and decisions from the last 14 days; honest empty states. Project cards edit status, risk level, due date, and progress.
- Demo workspace seed; seeded users sign in through the normal authenticated APIs (the unauthenticated `/demo` API was removed).
- Rate limiting on all routes, with stricter limits on public credential, token, and demo-request endpoints.
- Swagger API docs are served only outside production.
- Activity timeline API.
- Public demo-request storage with a 5-day expiration policy.
- Seeded and newly registered users use the same authenticated, tenant-scoped production APIs.
- Server-side grounded assistant (`POST /api/v1/assistant/ask`): tenant-scoped retrieval over documents, knowledge items, and projects; provider adapter with a local mock; validated citations; computed confidence and missing terms; audit records without prompt text; per-IP rate limit. The UI shows cited sources, confidence, and an honest no-evidence state.
- Language selector and broad UI translation coverage.
- Professional UI polish, first-workspace empty states, password visibility controls, profile page, logout button, and improved 3D knowledge map.
- Responsive mobile navigation with access to every application module, profile, and logout.
- Complete aligned interface dictionaries for English, Albanian, Italian, German, and French, including authentication recovery, verification, and document-processing flows.
- Automated frontend translation tests enforce key parity, non-empty values, authentication-recovery coverage, and safe unknown-key fallback behavior.
- Language-aware assistant prompt handling and confidence messages based on actual source coverage.
- Browser QA of login/logout, project creation, knowledge creation, profile update, organization settings, invitation creation/cancellation, document upload/extraction, assistant answers, and translations.
- Empty workspaces no longer display invented management priorities or outdated document-pipeline messaging.
- Password inputs expose separate, accessible input and visibility-toggle labels.
- Local testing is no-cost by default: local MongoDB/Redis/MinIO, mock AI, no payment collection, and no external provider calls.
- Integrations are clearly marked as planned and cannot initiate OAuth or paid-service activity during local testing.
- Team members list and pending invitation workflow for real workspaces.
- Secure invitation inspection and acceptance for existing and new users.
- Single-use invitation tokens stored as hashes, with expiry handling and local preview links.
- Organization switching with membership validation and tenant-scoped session rotation.
- Revoked and expired session validation on every authenticated API request.
- Real project and knowledge-item create, update, and archive controls with role-aware read-only states.
- Active-tenant filters are applied inside project, knowledge, and document queries, with regression tests for cross-organization access.
- Public and authenticated routes are loaded on demand; the initial JavaScript bundle was reduced from about 924 KB to about 239 KB, with Three.js isolated in a deferred chunk.
- The local launcher automatically selects free API and web ports and updates the web proxy without stopping unrelated applications.
- The web app is organized by feature (`src/features/*`), translations live in `src/i18n/locales/*` with compile-time key checking, and every app screen has its own URL.

## In Progress

- Authentication hardening.
- Resource-level permissions beyond the current role model.
- Production-grade file safety scanning and document observability.
- Semantic and assistant retrieval architecture beyond implemented keyword document search.
- Repeatable automated browser regression suite.

## Still To Do

- Add production email delivery for invitations, verification, and password reset.
- Extend the current role-based controls with item-level sharing and resource-level permissions.
- Add production malware scanning and richer processing metrics.
- Add metadata filters and semantic/vector ranking to the implemented keyword search.
- Add a hosted-model adapter behind the assistant provider interface, then embeddings and hybrid ranking.
- Add a dedicated risk record (severity, likelihood, owner, status) if teams need to track risks to closure, and "unanswered questions" from assistant no-evidence results.
- Add real integrations after core documents/search/AI are stable.
- Expand integration and end-to-end coverage for invitations, document storage, browser workflows, and AI retrieval.
- Add CI pipeline and deployment configuration.
- Add monitoring, structured logging, request IDs, safe logging policies, and production secrets management.

## Next Recommended Work

1. Add browser-level authentication, document processing, CRUD, dashboard, translation, and permission regression tests.
2. Add provider-independent embeddings and hybrid ranking tests.
3. Connect an email delivery abstraction for production invitation links.
