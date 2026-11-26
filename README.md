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

- Node.js 20.19+ or 22.12+
- npm 10+
- Docker Desktop

## Local Development

```bash
npm install
cp .env.example .env
npm run dev:start
```

`WEB_APP_URL` controls local invitation preview links and should match the frontend URL (normally `http://localhost:5173`). The local `.env` file is ignored by Git.

If your terminal is still using Node 16 or 18, switch to Node 20.19+ or 22.12+ before running the app.

The API defaults to `http://localhost:4000` and the web app to `http://localhost:5173`.
If either port is already in use, `npm run dev:start` selects the next free port and prints the actual URLs without stopping the other application.

### No-Cost Test Mode

The default local configuration does not contact paid services or require payment details:

- MongoDB runs from your existing local installation, or the optional Docker profile.
- Redis and MinIO run locally in Docker on Novera-specific ports.
- `AI_PROVIDER=mock` keeps assistant responses inside the application without an external AI API call.
- Email, SMS, OAuth integrations, billing, and cloud storage are not activated.
- Integration cards are a planned catalog only and cannot start external authorization.

Keep `AI_API_KEY` empty while testing locally.

To check or stop the local app:

```bash
npm run dev:status
npm run dev:stop
```

Logs are written to `tmp/dev-logs`.

You can also request explicit ports when needed:

```bash
API_PORT=4100 WEB_PORT=5180 npm run dev:start
```

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
Current product/build status is tracked in [docs/17-current-status.md](docs/17-current-status.md).

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
- `POST /api/v1/auth/login`
- `POST /api/v1/documents/upload`
- `GET /api/v1/documents/search?query=...`
- `POST /api/v1/documents/:documentId/reprocess`

TXT and Markdown are extracted immediately. PDF and DOCX processing uses the local Redis-backed BullMQ worker. Extracted content is chunked and searchable in MongoDB without a paid AI or search provider.

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
