# Decisions Log

## 2026-07-20: Use The Name Novera For MVP Work

Decision: use `Novera` as the working product name.

Trade-offs: short, memorable, and suitable for a global SaaS brand. Legal and domain checks are still required.

## 2026-07-20: Use A Monorepo

Decision: use an npm workspace monorepo with `apps/api`, `apps/web`, and shared packages.

Trade-offs: faster MVP coordination, shared TypeScript types, consistent tooling, and simpler local development. Separate repos may be useful later if teams split strongly.

## 2026-07-20: MongoDB First With Replaceable Vector Layer

Decision: use MongoDB and plan for MongoDB Atlas Vector Search in the MVP.

Trade-offs: aligns with requested stack and flexible metadata. PostgreSQL with pgvector has strong relational benefits, but would complicate the MongoDB-first architecture.

## 2026-07-20: Mock Integrations Until Core Platform Is Stable

Decision: integrations are represented architecturally and in UI first. Implement one simple integration after auth, organizations, projects, documents, and AI retrieval are stable.

Trade-offs: avoids spending the MVP on OAuth plumbing before the core value is demonstrated.

## 2026-07-22: Use `password` Field For Seeded Demo Credentials

Decision: seeded demo users store the scrypt-hashed credential value in a field named `password`.

Trade-offs: this matches the current project naming request and keeps demo data easy to inspect in MongoDB. The value remains hashed, and the old `passwordHash` field is removed by the seed script for seeded `@novera.test` users.

## 2026-09-01: Implement Pending Invitations Before Email Delivery

Decision: add a production invitation workflow that stores pending invitations, role, expiry, inviter, cancellation state, and activity events before implementing SMTP delivery and accept-link onboarding.

Trade-offs: this makes the Team page and organization collaboration workflow real sooner, while keeping external email configuration and secure invite acceptance for the next authentication hardening pass.

## 2026-09-01: Local Invitation Preview Links

Decision: store invitation tokens only as SHA-256 hashes. Development responses may return a one-time acceptance URL for local testing; production responses never expose the raw token.

Trade-offs: the local preview URL is available only immediately after creation. Production still needs an email provider before invitations can be delivered automatically.

## 2026-09-01: Rotate Tenant Sessions When Switching Organizations

Decision: create new access and refresh tokens scoped to the selected organization, then revoke the previous session only after the replacement session succeeds.

Trade-offs: switching performs an additional session write, but tenant identity remains server-issued and cannot be changed by trusting a client organization ID.

## 2026-09-01: Store Document Binaries Outside MongoDB

Decision: upload document binaries to S3-compatible object storage under organization-prefixed keys and store only metadata, checksums, processing state, and extracted text in MongoDB.

Trade-offs: local development requires MinIO for real uploads, but database size stays controlled and the storage provider can be replaced without changing document authorization rules.

## 2026-09-01: Upgrade React Router After Dependency Audit

Decision: upgrade React Router from v6 to v7.18.3 after npm reported moderate open-redirect and SSR hydration advisories with no patched v6 release.

Trade-offs: this is a major dependency upgrade, but Novera uses routing APIs retained by v7 and the migration passed lint, tests, and production compilation. The production dependency audit now reports zero known vulnerabilities.

## 2026-09-03: No-Cost Local Testing By Default

Decision: local development uses MongoDB, Redis, MinIO, and the grounded mock assistant without contacting paid external providers. Integration cards remain a transparent planned catalog and do not expose fake connection actions. Demo and pricing flows never request payment details.

Trade-offs: email delivery, hosted AI, cloud storage, SMS, OAuth integrations, and billing remain unavailable in local testing. Each can be introduced later behind an explicit configuration flag after cost, quota, privacy, and failure behavior are reviewed.

## 2026-09-25: Scope Resource Queries To The Active Tenant

Decision: project, knowledge, and document lookups include the authenticated session's organization ID in the database query itself. Client-provided organization IDs never select the tenant.

Trade-offs: service methods perform an active-membership check before each tenant-owned query, adding a small database cost in exchange for a clear cross-organization isolation boundary.

## 2026-09-25: Use One Authenticated Workspace Path

Decision: seeded demo users and newly registered users both use the production authentication and tenant-scoped workspace APIs. Public demo credentials remain documented locally but are not shown on the login or signup screens.

Trade-offs: local demonstrations require MongoDB seed data and a running API, but behavior now matches the real product instead of maintaining a second mutation path.

## 2026-09-25: Select Development Ports Without Stopping Other Apps

Decision: the development launcher probes for free API and web ports, passes the selected API address to Vite's proxy, and prints the actual URLs. It never stops an unrelated process to reclaim a preferred port.

Trade-offs: local URLs may differ from the defaults when ports are occupied, so invitation preview URLs and proxy configuration are supplied dynamically by the launcher.

## 2026-09-25: Store Authentication Action Tokens As Hashes

Decision: email-verification and password-reset links use random 256-bit single-use tokens. Only SHA-256 hashes are stored in MongoDB, earlier unused tokens are invalidated, verification links expire after 24 hours, and reset links expire after one hour.

Trade-offs: development can return a local preview URL for testing, while production requires an email-delivery adapter. Password resets revoke every active user session, which is deliberately less convenient but limits damage from a compromised session.

## 2026-09-25: Replace Custom JWT Handling

Decision: use the audited `jsonwebtoken` package for HS256 access and refresh token signing and verification, with explicit algorithm allow-listing and the existing server-side session checks.

Trade-offs: this adds a small dependency but removes custom cryptographic token parsing and keeps existing local token semantics compatible.

## 2026-09-29: Process Documents Locally Before Adding Hosted AI

Decision: use local PDF and DOCX extraction, deterministic extractive summaries, BullMQ with Redis, and tenant-scoped MongoDB text indexes for the first production document pipeline. TXT and Markdown stay synchronous; binary document extraction runs in a retryable background worker.

Trade-offs: the MVP gains real searchable documents without paid APIs, but keyword ranking is less flexible than hybrid vector search and local summaries are not abstractive. Provider-independent embeddings and model-generated answers will be layered on only after authorization, citation, and evaluation coverage are in place.

## 2026-11-26: Remove The Unauthenticated Demo API

Decision: delete the `/demo` API module. It wrote to the same `users`, `organizations`, and `projects` collections as the production modules without authentication, so anyone could rename any user by email or add records to the demo organization. Seeded demo users already sign in through `/auth` and use the tenant-checked production endpoints.

Trade-offs: local demos now require the API, MongoDB, and `npm run seed:demo`, which was already the case for the frontend.

## 2026-11-26: Rate Limit The API

Decision: use `@nestjs/throttler` as a global guard (120 requests per minute per IP) with a 10-per-minute limit on public credential, token, and demo-request endpoints. Swagger is disabled when `NODE_ENV=production`.

Trade-offs: counters are kept in memory per API instance, so limits are per instance until a Redis-backed throttler store is added for multi-instance deployments.

## 2026-11-26: Organize The Web App By Feature

Decision: split the 2,200-line `AppShell.tsx` into one folder per screen under `apps/web/src/features/`, move shared pieces to `components/`, and move the five translation dictionaries out of the sample-data file into `apps/web/src/i18n/locales/`. `TranslationKey` is now the union of the English keys, so a missing or misspelled key in any language fails the type check. Each app screen has its own URL (`/app`, `/app/projects`, `/app/documents`, ...) served by one route with an optional `:section` segment, so the shell keeps its state while users navigate, and links, refresh, and the back button work.

Trade-offs: `AppShell` still owns workspace loading and all mutations and passes them to views as props. Moving server state into TanStack Query is the next step and will let each feature load its own data. Production hosting must serve `index.html` for every `/app/*` path.
