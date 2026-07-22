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
