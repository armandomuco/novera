# Novera

Novera is an AI Digital Twin for Businesses: a permission-aware knowledge layer that organizes company documents, decisions, projects, risks, activity, and context into a searchable operating memory.

Domain and trademark availability for the name `Novera` must be verified separately before public launch.

## MVP Scope

The first build focuses on a stable demo foundation:

- Multi-tenant organizations and role model.
- Authentication module skeleton with JWT/session direction.
- Project and knowledge architecture.
- Document upload and processing architecture.
- Permission-aware AI assistant contract.
- Search and dashboard product design.
- Public landing page and application shell.

## Repository Structure

```text
/
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── config/
│   ├── eslint-config/
│   ├── shared-types/
│   └── ui/
├── docs/
├── infrastructure/
├── scripts/
├── docker-compose.yml
└── package.json
```

## Prerequisites

- Node.js 20.11+
- npm 10+
- Docker Desktop

## Local Development

```bash
npm install
cp .env.example .env
npm run dev:start
```

If your terminal is still using Node 16 or 18, switch to Node 20.11+ before running the app.

The API defaults to `http://localhost:4000`.
The web app defaults to `http://localhost:5173`.

To check or stop the local app:

```bash
npm run dev:status
npm run dev:stop
```

Logs are written to `tmp/dev-logs`.

To create demo database records in the Novera MongoDB database:

```bash
npm run seed:demo
```

By default this writes to your existing local MongoDB:

```text
mongodb://localhost:27017/novera
```

Demo users are listed in [docs/demo-users.md](docs/demo-users.md).
Demo workspace data is listed in [docs/demo-data.md](docs/demo-data.md).

If you already have Redis and MinIO running locally too, skip Docker startup:

```bash
SKIP_DOCKER=1 npm run dev:start
```

To stop both the app processes and Docker dependencies:

```bash
npm run dev:down
```

## API

```bash
cd apps/api
npm run dev
```

Useful endpoints:

- `GET /api/v1/health`
- `GET /api/v1/auth/status`
- `GET /api/v1/organizations/status`

## Frontend

```bash
cd apps/web
npm run dev
```

## Docker

```bash
docker compose up -d
docker compose down
```

Local services:

- Redis: `localhost:6380`
- MinIO API: `localhost:9010`
- MinIO console: `localhost:9011`

The default setup uses your existing local MongoDB at `localhost:27017` and creates only the `novera` database. Docker MongoDB is optional:

```bash
docker compose --profile docker-mongo up -d
MONGODB_URI=mongodb://localhost:27018/novera npm run seed:demo
```

Redis and MinIO use non-default ports so they do not collide with other applications. You can override ports in `.env`.

## Coding Conventions

- TypeScript strict mode.
- DTOs for API inputs and outputs.
- Validate external input at module boundaries.
- Never trust client-provided organization IDs without membership checks.
- Keep tenant filters in every organization-owned query.
- Use soft deletion for business records.
- Avoid logging secrets, tokens, document contents, or private prompts.

## Git Workflow

- Keep commits small and focused.
- Branch by milestone or feature: `feature/auth-foundation`.
- Open pull requests with test notes and risk notes.
- Update `/docs/14-decisions-log.md` when architecture or product decisions change.

## Definition of Done

- Code compiles.
- Tests pass or skipped tests are explicitly justified.
- Security and tenant-isolation implications are considered.
- Docs are updated for changed behavior.
- UX states are covered: loading, empty, error, and permission denied.
