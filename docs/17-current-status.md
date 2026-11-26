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
- NestJS is aligned on 11.2.6, Multer is pinned to patched 2.4.0, and Vitest is on 5.0.2. A production dependency audit on 2026-11-26 reports new advisories (including mongoose and body-parser) that still need upgrades.
- Demo workspace seed; seeded users sign in through the normal authenticated APIs (the unauthenticated `/demo` API was removed).
- Rate limiting on all routes, with stricter limits on public credential, token, and demo-request endpoints.
- Swagger API docs are served only outside production.
- Activity timeline API.
- Public demo-request storage with a 5-day expiration policy.
- Seeded and newly registered users use the same authenticated, tenant-scoped production APIs.
- Workspace-grounded assistant behavior that refuses to answer when there is not enough visible information.
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
- Dashboard production data coverage.
- Production-grade file safety scanning and document observability.
- Semantic and assistant retrieval architecture beyond implemented keyword document search.
- Repeatable automated browser regression suite.

## Still To Do

- Add production email delivery for invitations, verification, and password reset.
- Extend the current role-based controls with item-level sharing and resource-level permissions.
- Add production malware scanning and richer processing metrics.
- Add metadata filters and semantic/vector ranking to the implemented keyword search.
- Add provider-independent AI service implementation, embeddings, prompt versioning, token tracking, source citations, and prompt-injection defenses.
- Connect dashboard risks, priorities, unanswered questions, overdue items, and suggested priorities to production data.
- Add real integrations after core documents/search/AI are stable.
- Expand integration and end-to-end coverage for invitations, document storage, browser workflows, and AI retrieval.
- Add CI pipeline and deployment configuration.
- Add monitoring, structured logging, request IDs, safe logging policies, and production secrets management.

## Next Recommended Work

1. Add production dashboard endpoints for risks, overdue work, and priorities.
2. Replace the remaining dashboard sample panels with real API data and honest empty states.
3. Add browser-level authentication, document processing, CRUD, translation, and permission regression tests.
4. Add provider-independent embeddings and hybrid ranking tests.
5. Connect an email delivery abstraction for production invitation links.
