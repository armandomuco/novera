# Current Project Status

Last updated: 2026-09-02.

## Done

- Product definition, market positioning, MVP scope, brand direction, architecture, API, database, AI, security, testing, deployment, roadmap, risks, and project-management docs.
- Novera working name, SVG logo, public landing page, pricing page, demo-request page, login, signup, and authenticated app shell.
- Monorepo foundation with NestJS API, React/Vite web app, shared packages, Docker Compose, linting, formatting, strict TypeScript, and starter tests.
- Local helper scripts for starting, stopping, checking status, full shutdown, Node version checking, and demo seeding.
- `.env.example` for shared defaults and local `.env` support ignored by git.
- MongoDB-backed authentication foundation: registration, login, access tokens, refresh-token rotation, logout, current-user lookup, profile update, scrypt password hashing, sessions, and owner organization creation.
- Tenant-aware organization membership validation.
- Organization profile/settings update.
- Project CRUD foundation with soft archive and activity events.
- Knowledge item CRUD foundation with soft archive and activity events.
- Document metadata creation/listing plus real multipart uploads and authenticated downloads.
- S3-compatible object storage with tenant-prefixed keys, file size/type/signature validation, SHA-256 checksums, and malware-scanning hook.
- Immediate searchable-text extraction for TXT and Markdown; explicit pending state for PDF/DOCX extraction.
- Production dependency audit currently reports zero known vulnerabilities.
- Demo workspace seed and demo API endpoints for projects, knowledge items, documents, profile update, and workspace loading.
- Activity timeline API.
- Public demo-request storage with a 5-day expiration policy.
- Frontend connection to production APIs for real accounts and demo APIs for seeded `@novera.test` accounts.
- Workspace-grounded assistant behavior that refuses to answer when there is not enough visible information.
- Language selector and broad UI translation coverage.
- Professional UI polish, first-workspace empty states, password visibility controls, profile page, logout button, and improved 3D knowledge map.
- Responsive mobile navigation with access to every application module, profile, and logout.
- Complete 227-key interface dictionaries for English, Albanian, Italian, German, and French.
- Language-aware assistant prompt handling and confidence messages based on actual source coverage.
- Browser QA of login/logout, project creation, knowledge creation, profile update, organization settings, invitation creation/cancellation, document upload/extraction, assistant answers, and translations.
- Empty workspaces no longer display invented management priorities or outdated document-pipeline messaging.
- Password inputs expose separate, accessible input and visibility-toggle labels.
- Team members list and pending invitation workflow for real workspaces.
- Secure invitation inspection and acceptance for existing and new users.
- Single-use invitation tokens stored as hashes, with expiry handling and local preview links.
- Organization switching with membership validation and tenant-scoped session rotation.
- Revoked and expired session validation on every authenticated API request.

## In Progress

- Authentication hardening.
- Team and permissions.
- Dashboard production data coverage.
- Documents processing pipeline for PDF/DOCX, chunks, and background jobs.
- AI/search architecture.
- Repeatable automated browser regression suite.

## Still To Do

- Replace the temporary HMAC token helper with a standard audited JWT library.
- Add email verification.
- Add password reset.
- Add production invitation email delivery.
- Add complete role-based and resource-level permissions.
- Add PDF/DOCX extraction, document chunks, summary generation, production malware scanning, and document processing jobs.
- Add Redis/BullMQ background jobs.
- Add hybrid keyword/metadata/semantic search.
- Add provider-independent AI service implementation, embeddings, prompt versioning, token tracking, source citations, and prompt-injection defenses.
- Connect dashboard risks, priorities, unanswered questions, overdue items, and suggested priorities to production data.
- Add real integrations after core documents/search/AI are stable.
- Add unit, integration, and end-to-end tests for auth, tenant isolation, invitations, projects, knowledge, documents, and AI retrieval.
- Add CI pipeline and deployment configuration.
- Add monitoring, structured logging, request IDs, safe logging policies, and production secrets management.

## Next Recommended Work

1. Add PDF/DOCX extraction, document chunks, and BullMQ processing jobs.
2. Add production dashboard endpoints for risks, overdue work, and priorities.
3. Add integration tests focused on tenant isolation and cross-organization denial.
4. Connect an email delivery abstraction for production invitation links.
