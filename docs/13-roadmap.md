# Roadmap

## Milestone 0: Discovery And Validation

Objective: validate the buyer, pain, wedge, and demo story.
Deliverables: interview plan, assumptions, competitor notes, validation criteria.
Complexity: Medium.

## Milestone 1: Foundation

Objective: create repo, docs, environments, API, web, Docker, linting, tests.
Status: mostly complete.
Deliverables: runnable skeleton, helper scripts, safe Docker ports, frontend demo routes, demo seed script, Mongo-backed demo API endpoints, and updated documentation.
Complexity: Medium.

## Milestone 2: Authentication And Organizations

Objective: secure user, session, organization, invitation, and role flows.
Dependencies: foundation.
Deliverables: auth APIs and tenant guard.
Status: started. Register, login, refresh, logout, me, password hashing, session storage, initial owner organization creation, organization membership reads, and protected access-token validation are implemented. Invitation, email verification, password reset, and organization switching remain.
Complexity: High.

## Milestone 3: Projects And Knowledge

Objective: capture structured operating memory.
Dependencies: auth/orgs.
Deliverables: projects, knowledge items, decisions, activity.
Status: started. Tenant-scoped projects and knowledge items can be created, listed, read, updated, and archived through authenticated API endpoints. Activity events are recorded for project and knowledge changes. The frontend now uses these production APIs for non-demo accounts while keeping the seeded demo workspace for `@novera.test` users.
Complexity: High.

## Milestone 4: Documents

Objective: upload, store, extract, chunk, summarize documents.
Dependencies: projects/knowledge.
Deliverables: document pipeline and searchable chunks.
Complexity: High.

## Milestone 5: Search And AI Assistant

Objective: permission-aware hybrid retrieval and grounded answers.
Dependencies: documents and knowledge.
Deliverables: assistant, citations, vector search, token tracking.
Complexity: Very high.

## Milestone 6: UI Completion

Objective: polished app shell and end-to-end user experience.
Dependencies: core APIs.
Status: in progress. Real signup lands in the user's own organization, and project/knowledge creation persists through production APIs. Documents, profile, settings, and assistant still need production API backing.
Deliverables: landing, login, signup, dashboard, explorer, assistant, projects, documents, integrations, team, activity, settings, language selector, and initial 3D knowledge-map visual.
Complexity: High.

## Milestone 7: Testing And Deployment

Objective: stabilize and demo safely.
Dependencies: core product.
Deliverables: tests, staging, monitoring, production runbook.
Complexity: High.

## Backlog Priorities

P0: auth, organizations, tenant isolation, projects, knowledge items, documents, AI answer contract, search, activity, dashboard shell.

P1: one real integration, advanced permissions, notification center, analytics summaries.

P2: graph explorer, billing, SSO, workflow automation, advanced reporting.

P3: mobile app, autonomous agents, deep data warehouse integration, marketplace integrations.
