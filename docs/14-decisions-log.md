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
