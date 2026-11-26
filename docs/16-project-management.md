# Project Management

## Epics

| Epic                           | Status      | Priority | Complexity | Milestone      |
| ------------------------------ | ----------- | -------- | ---------- | -------------- |
| Product validation             | Planned     | P0       | Medium     | 0              |
| Monorepo foundation            | Done        | P0       | Medium     | 1              |
| Authentication and sessions    | In progress | P0       | High       | 2              |
| Organizations and permissions  | In progress | P0       | High       | 2              |
| Projects and knowledge items   | In progress | P0       | High       | 3              |
| Documents and processing       | In progress | P0       | High       | 4              |
| Hybrid search and AI assistant | In progress | P0       | Very high  | 5              |
| Demo-ready UI                  | In progress | P0       | High       | 6              |
| Testing and deployment         | Planned     | P0       | High       | 7              |
| First real integration         | Planned     | P1       | High       | After MVP core |

## User Stories

| Story                                                                                                             | Acceptance Criteria                                                                                 | Dependencies       | Priority | Complexity | Milestone | Status      |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------ | -------- | ---------- | --------- | ----------- |
| As a visitor, I want to understand the product quickly, so that I can decide whether to try it.                   | Landing page explains value and opens demo shell.                                                   | Foundation         | P0       | Low        | 1         | Done        |
| As a user, I want to register and verify my email, so that my account is trusted.                                 | Email, password, verification token, secure hash, validation.                                       | Foundation         | P0       | Medium     | 2         | In progress |
| As a user, I want to create an organization, so that my company data has a tenant boundary.                       | Organization record, owner membership, settings.                                                    | Auth               | P0       | Medium     | 2         | In progress |
| As an administrator, I want to invite members, so that my team can collaborate.                                   | Invite email, role assignment, expiry, cancellation, and activity event.                            | Orgs               | P0       | Medium     | 2         | In progress |
| As a manager, I want to create projects, so that company context is organized.                                    | CRUD, archive, status, timeline, members.                                                           | Orgs               | P0       | Medium     | 3         | In progress |
| As an employee, I want to add decisions and notes, so that context is not lost.                                   | Knowledge item types, tags, permissions, project link.                                              | Projects           | P0       | Medium     | 3         | In progress |
| As an employee, I want to upload documents, so that they become searchable.                                       | File validation, storage, extraction, chunks, processing status, retry, and keyword search.         | Knowledge          | P0       | High       | 4         | In progress |
| As a manager, I want to ask why a project is delayed, so that I can act faster.                                   | Answer uses authorized sources, citations, limits, related records.                                 | Search/docs        | P0       | Very high  | 5         | Planned     |
| As an owner, I want a dashboard of risks and priorities, so that I know what to focus on.                         | Active projects, risks, recent decisions, documents, suggested priorities.                          | Projects/knowledge | P0       | Medium     | 6         | Done        |
| As an administrator, I want to see integration options, so that I understand future data sources.                 | Mock catalog, provider states, sync architecture copy.                                              | Foundation         | P1       | Low        | 6         | In progress |
| As a buyer, I want to request a time-limited demo, so that I can evaluate Novera without public demo credentials. | Request form saves name, email, company, role, size, use case, status, and 5-day expiration window. | Foundation         | P0       | Low        | 6         | Done        |
| As a buyer, I want to compare plans, so that I understand expected pricing before contacting the team.            | Pricing page shows Starter, Growth, and Scale plans with clear CTAs.                                | Foundation         | P0       | Low        | 6         | Done        |

## Initial Sprint Plan

Sprint goal: establish a credible, runnable product foundation that supports investor and developer conversations.

Tasks:

- Create monorepo structure.
- Add product, brand, architecture, API, database, security, deployment, testing, roadmap, and risk docs.
- Add NestJS API skeleton with health, auth status, organization status, Swagger, environment validation, and global validation pipe.
- Add Vite React shell with landing page, dashboard shell, navigation, logo, and sample data.
- Add shared TypeScript packages.
- Add Docker Compose for MongoDB, Redis, and S3-compatible object storage.
- Add starter unit test.
- Add README and contribution workflow.
- Add demo users Markdown reference.
- Add demo MongoDB seed script.
- Add interactive frontend workspace with dashboard, assistant, projects, knowledge, documents, integrations, team, activity, settings, language selector, and 3D knowledge map.
- Add profile page, profile update state, and logout flow.
- Add reusable password visibility controls for all password inputs.
- Add real auth endpoints for registration, login, refresh-token rotation, logout, and current user lookup.
- Store real auth users, organizations, owner memberships, and sessions in MongoDB.
- Add authenticated organization membership read endpoints.
- Add tenant-validated project create, list, read, update, and archive endpoints.
- Add tenant-validated knowledge item create, list, read, update, and archive endpoints.
- Add activity-event recording for project and knowledge item changes.
- Make language selector update core app labels in multiple languages.
- Extend translations across landing, login, signup, dashboard, assistant, forms, tables, settings, and 3D map labels.
- Improve the 3D knowledge map composition with domain labels, centered constellation, orbit rings, and live-context status.
- Make visible document, integration, settings, and assistant actions provide UI feedback.
- Switch default seed target to existing local MongoDB at `localhost:27017/novera`, with Docker MongoDB available only through the `docker-mongo` profile.
- Add Mongo-backed demo API endpoints for workspace data, demo login, and profile update.
- Connect the frontend workspace to those demo API endpoints with local fallback data when the API is unavailable.
- Rename seeded demo user credential field from `passwordHash` to `password`.
- Verify local MongoDB seeded users contain `password` and no longer contain `passwordHash`.
- Add demo API mutations for creating projects, knowledge items, and document metadata.
- Wire project, knowledge, and document creation controls to the demo API.
- Connect real authenticated frontend workspaces to production `auth/me`, `projects`, `knowledge-items`, and `activity` APIs.
- Fix current-user authorization after registration/login so protected API routes accept fresh access tokens.
- Wire project and knowledge creation controls to production APIs for non-demo accounts while preserving demo mode for `@novera.test`.
- Make signup copy and CTA adapt between real workspace creation and demo workspace creation.
- Remove visible demo-account credentials from public login and signup screens.
- Remove default values from login and signup forms and replace them with placeholders.
- Add public demo-request page and backend request storage with a 5-day demo-expiration policy.
- Add public pricing page with Starter, Growth, and Scale plans.
- Require a real authenticated session before entering `/app`.
- Replace the assistant's fixed canned answer with workspace-grounded answer generation from visible projects, knowledge, risks, and activity.
- Add production profile update through `PATCH /api/v1/auth/me`.
- Add production organization settings update through `PATCH /api/v1/organizations/:organizationId`.
- Add production document metadata module with `GET /api/v1/documents` and `POST /api/v1/documents`.
- Wire profile, settings, and document metadata controls to production APIs.
- Create local `.env` for development while keeping real env files ignored by git.
- Add production organization members and pending invitations endpoints.
- Add pending invitation creation, cancellation, expiry metadata, duplicate prevention, role validation, and activity-event recording.
- Add Team page invite form, role selector, pending invitation list, and cancel action for real authenticated workspaces.
- Add secure invitation inspection and acceptance for existing and new users.
- Add development-only invitation preview links while keeping production tokens private.
- Add tenant-scoped organization switching with session rotation.
- Verify invitation and switching flows end to end against local MongoDB.
- Replace the metadata-only document form with real multipart file upload.
- Add S3-compatible MinIO storage, file validation, checksums, processing states, and authenticated download.
- Extract searchable TXT and Markdown content synchronously while PDF/DOCX jobs remain pending.
- Verify Markdown upload, extraction, checksum, download, and unsupported-file rejection end to end.

Acceptance criteria:

- `npm install` completes.
- `npm test` passes.
- `npm run build` passes.
- `docker compose up -d` starts local dependencies.
- API health route and Swagger route are available.
- Web landing page and app shell render locally.
- Frontend demo has login, signup, navigation, assistant interaction, and realistic sample data.

## Completed So Far

- Product, market, architecture, database, API, AI, security, testing, deployment, roadmap, and risk documentation.
- Novera working name, brand direction, SVG logo, and design-system direction.
- Monorepo scaffold with NestJS API, React/Vite web app, shared packages, Docker Compose, CI, linting, formatting, strict TypeScript, and starter tests.
- Safe local Docker ports to avoid common conflicts with other applications.
- Helper scripts for start, stop, status, full down, Node check, and demo seeding.
- Frontend routes for landing, login, signup, and app workspace.
- Password visibility toggle on login and signup fields.
- Real auth foundation with MongoDB-backed users, organizations, owner memberships, sessions, scrypt password hashing, access tokens, refresh-token rotation, logout, and current-user lookup.
- Protected organization membership endpoints.
- Protected project API with tenant membership validation, role checks, DTO validation, response mapping, and soft archive.
- Protected knowledge item API with tenant membership validation, optional project validation, DTO validation, response mapping, and soft archive.
- Activity API and activity recording for project and knowledge changes.
- Interactive product demo with Acme Studio sample data.
- Profile page and logout flow.
- Working language selector for main application labels.
- Expanded translation coverage across the public landing page, authentication pages, and demo workspace UI.
- Improved 3D business knowledge map with translated domain labels and a more balanced visual composition.
- Local MongoDB seed default so the `novera` database appears in the developer's existing MongoDB.
- Optional Docker MongoDB profile for isolated database testing.
- Demo workspace API: `GET /api/v1/demo/workspace`.
- Demo login API: `POST /api/v1/demo/login`.
- Demo profile update API: `PATCH /api/v1/demo/profile`.
- Demo project creation API: `POST /api/v1/demo/projects`.
- Demo knowledge creation API: `POST /api/v1/demo/knowledge-items`.
- Demo document metadata API: `POST /api/v1/demo/documents`.
- Real authenticated workspaces now load their own organization, projects, knowledge items, and activity from production APIs.
- Real project creation from the app shell persists through `POST /api/v1/projects`.
- Real knowledge creation from the app shell persists through `POST /api/v1/knowledge-items`.
- Freshly registered real users no longer fall back to the Acme Studio demo workspace after signup.
- Signup now distinguishes real workspace creation from demo workspace creation in its visible CTA and translated copy.
- Public login and signup no longer show demo users or pre-filled demo credentials.
- Public demo access now starts with `POST /api/v1/demo-requests`; approved demos should be created manually and expire after 5 days.
- Pricing page added with recommended initial packaging: Starter at 99 EUR/month, Growth at 249 EUR/month, and Scale as custom.
- App shell now redirects unauthenticated users to login instead of opening a public forever-demo workspace.
- Assistant answers now use the current workspace data and state when there is not enough information.
- Profile name updates now persist through the authenticated API.
- Organization name, industry, and AI-provider preference now persist through the authenticated organization API.
- Document metadata creation/listing now works for real authenticated workspaces and records activity events.
- Local `.env` exists for development and remains ignored by git.
- Organization members can be listed through `GET /api/v1/organizations/:organizationId/members`.
- Pending organization invitations can be listed, created, and cancelled through production APIs.
- Team page now supports inviting members and cancelling pending invitations for real authenticated workspaces.
- Existing and new users can accept single-use, expiring invitations through a dedicated page.
- Users with multiple memberships can switch organizations from the application header.
- Authenticated requests now reject revoked or expired backing sessions.
- Email verification and password reset now use hashed, expiring, single-use action tokens with local preview links and translated screens.
- Password reset revokes every active session, and JWT handling now uses the audited `jsonwebtoken` library.
- Real document uploads and authorized downloads work against MinIO/S3-compatible storage.
- TXT and Markdown documents become searchable immediately; PDF and DOCX are extracted by a retryable BullMQ worker.
- Document text is normalized into overlapping tenant-scoped chunks with deterministic local summaries.
- Authorized document content search returns ranked excerpts and source downloads from the active tenant only.
- The Documents page polls active processing jobs and exposes visible failure details and a retry action.
- Live verification covered TXT extraction/search and real DOCX queue processing against local MongoDB, Redis, and MinIO.
- Project and knowledge-item edit/archive actions now persist through production APIs and respect role-based read-only states.
- Document mutations reject Viewer accounts and document downloads are scoped directly to the active tenant.
- Tenant-isolation regression tests cover project, knowledge, and document query boundaries.
- Public and application routes are code-split, with Three.js isolated from the initial application bundle.
- The development launcher selects free ports automatically and leaves unrelated local applications untouched.
- NestJS dependencies and upload middleware were updated to patched versions; the dependency audit reports zero known vulnerabilities.

## Still To Do Next

- Add an internal admin review screen for demo requests and manual demo workspace creation.
- Enforce demo account expiration in authentication/session validation once demo accounts are created by the team.
- Connect production email delivery for invitation, verification, and password-reset links.
- Add a production malware-scanning provider before accepting untrusted public uploads.
- Add item-level ownership and resource-sharing rules beyond role membership.
- Connect all dashboard risks, priorities, unanswered questions, and overdue data to production API modules.
- Translate seeded demo business records or add localized demo datasets if the product demo needs fully localized sample content.
- Add automated browser regression checks for authentication, CRUD, translation switching, permissions, and 3D canvas rendering.
- Add semantic embeddings and merge vector ranking with the implemented document keyword search.
- Add source-grounded AI retrieval and citation validation.

## Recommended Next Sprint

Complete production dashboard data and begin grounded retrieval:

- Add production risks, overdue work, unanswered questions, and suggested-priority endpoints.
- Replace remaining dashboard sample panels with API data and honest empty states.
- Add a provider-independent embedding interface and hybrid ranking tests.
- Add browser regression tests for login, all-role permissions, CRUD, translations, and the 3D canvas.
