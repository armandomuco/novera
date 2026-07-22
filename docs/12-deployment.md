# Deployment

## Environments

- Development: local Docker Compose.
- Testing: disposable services in CI.
- Staging: production-like managed services.
- Production: managed database, managed Redis, object storage, observability, backups.

## Services

- Web app: static Vite build hosted behind CDN.
- API: NestJS container.
- Worker: NestJS/BullMQ worker container.
- MongoDB: managed Atlas recommended for MVP vector search.
- Redis: managed Redis.
- Object storage: S3-compatible bucket.

## CI Pipeline

- Install dependencies.
- Typecheck.
- Lint.
- Unit tests.
- Build API and web.
- Dependency audit.
- Container build.
- Deploy to staging after main branch merge.
