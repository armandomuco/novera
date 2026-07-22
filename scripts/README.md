# Scripts

Project automation scripts belong here. Keep scripts idempotent, documented, and safe to run from the repository root.

## Local App Scripts

- `npm run dev:start`: starts Docker dependencies, the API, and the web app.
- `npm run dev:status`: shows whether the API and web app processes are running.
- `npm run dev:stop`: stops the API and web app processes started by `dev:start`.
- `npm run dev:down`: stops the app processes and Docker Compose dependencies.
- `npm run seed:demo`: creates or updates the Acme Studio demo data in the `novera` MongoDB database.

Process IDs are stored in `tmp/dev-pids`. Logs are stored in `tmp/dev-logs`.

Use `SKIP_DOCKER=1 npm run dev:start` when Redis and MinIO are already running outside this Compose project.

The demo seed script uses `MONGODB_URI` and defaults to `mongodb://localhost:27017/novera`, so it appears in your local MongoDB as the `novera` database.
