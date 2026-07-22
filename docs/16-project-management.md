# Project Management

## Epics

| Epic | Status | Priority | Complexity | Milestone |
| --- | --- | --- | --- | --- |
| Product validation | Planned | P0 | Medium | 0 |
| Monorepo foundation | Done | P0 | Medium | 1 |
| Authentication and sessions | Planned | P0 | High | 2 |
| Organizations and permissions | Planned | P0 | High | 2 |
| Projects and knowledge items | Planned | P0 | High | 3 |
| Documents and processing | Planned | P0 | High | 4 |
| Hybrid search and AI assistant | Planned | P0 | Very high | 5 |
| Demo-ready UI | In progress | P0 | High | 6 |
| Testing and deployment | Planned | P0 | High | 7 |
| First real integration | Planned | P1 | High | After MVP core |

## User Stories

| Story | Acceptance Criteria | Dependencies | Priority | Complexity | Milestone | Status |
| --- | --- | --- | --- | --- | --- | --- |
| As a visitor, I want to understand the product quickly, so that I can decide whether to try it. | Landing page explains value and opens demo shell. | Foundation | P0 | Low | 1 | Done |
| As a user, I want to register and verify my email, so that my account is trusted. | Email, password, verification token, secure hash, validation. | Foundation | P0 | Medium | 2 | Planned |
| As a user, I want to create an organization, so that my company data has a tenant boundary. | Organization record, owner membership, settings. | Auth | P0 | Medium | 2 | Planned |
| As an administrator, I want to invite members, so that my team can collaborate. | Invite email, role assignment, expiry, audit event. | Orgs | P0 | Medium | 2 | Planned |
| As a manager, I want to create projects, so that company context is organized. | CRUD, archive, status, timeline, members. | Orgs | P0 | Medium | 3 | Planned |
| As an employee, I want to add decisions and notes, so that context is not lost. | Knowledge item types, tags, permissions, project link. | Projects | P0 | Medium | 3 | Planned |
| As an employee, I want to upload documents, so that they become searchable. | File validation, storage, metadata, processing status. | Knowledge | P0 | High | 4 | Planned |
| As a manager, I want to ask why a project is delayed, so that I can act faster. | Answer uses authorized sources, citations, limits, related records. | Search/docs | P0 | Very high | 5 | Planned |
| As an owner, I want a dashboard of risks and priorities, so that I know what to focus on. | Active projects, risks, recent decisions, documents, suggested priorities. | Projects/knowledge | P0 | Medium | 6 | In progress |
| As an administrator, I want to see integration options, so that I understand future data sources. | Mock catalog, provider states, sync architecture copy. | Foundation | P1 | Low | 6 | In progress |

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
- Make language selector update core app labels in multiple languages.
- Make visible document, integration, settings, and assistant actions provide UI feedback.
- Switch default seed target to existing local MongoDB at `localhost:27017/novera`, with Docker MongoDB available only through the `docker-mongo` profile.

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
- Interactive product demo with Acme Studio sample data.
- Profile page and logout flow.
- Working language selector for main application labels.
- Local MongoDB seed default so the `novera` database appears in the developer's existing MongoDB.
- Optional Docker MongoDB profile for isolated database testing.

## Still To Do Next

- Replace frontend-only demo login with real backend authentication.
- Add Mongoose schemas inside the API for users, organizations, sessions, and memberships.
- Connect login/signup forms to API endpoints.
- Add real JWT access tokens and refresh token rotation.
- Add tenant membership guards.
- Connect dashboard data to MongoDB instead of local demo data.
- Replace localStorage profile updates with API-backed user profile updates.
- Expand translation coverage to every paragraph and table label.
- Add document upload and processing pipeline.
- Add hybrid search and source-grounded AI retrieval.

## Recommended Next Sprint

Implement real authentication and organization creation:

- User schema and repository.
- Password hashing.
- Register/login DTOs and response models.
- JWT access tokens.
- Refresh sessions with rotation.
- Organization schema.
- Owner membership creation.
- Tenant membership guard.
- Auth and organization integration tests.
