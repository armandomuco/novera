# Demo Data

The current product demo uses the Acme Studio workspace.

## MongoDB

The demo seed script writes to the `novera` database configured by `MONGODB_URI`.

Default local MongoDB target:

```text
mongodb://localhost:27017/novera
```

Optional Docker MongoDB target:

```text
mongodb://localhost:27018/novera
```

Run:

```bash
npm run seed:demo
```

To force your existing local MongoDB:

```bash
MONGODB_URI=mongodb://localhost:27017/novera npm run seed:demo
```

To use Docker MongoDB:

```bash
docker compose --profile docker-mongo up -d
MONGODB_URI=mongodb://localhost:27018/novera npm run seed:demo
```

Expected seed output:

```json
{
  "database": "novera",
  "counts": {
    "users": 5,
    "organizations": 1,
    "organizationMembers": 5,
    "projects": 3,
    "knowledgeItems": 4,
    "documents": 3,
    "risks": 2,
    "activityEvents": 4
  }
}
```

The script creates or updates these collections:

- `users`
- `organizations`
- `organizationMembers`
- `projects`
- `knowledgeItems`
- `documents`
- `risks`
- `activityEvents`

It does not delete or modify other databases.

The demo user field is named `password`. The seed script stores a hashed scrypt value in that field and removes the older `passwordHash` field from seeded demo users.

## Demo Projects

| Project | Status | Risk | Owner | Summary |
| --- | --- | --- | --- | --- |
| Atlas onboarding | Delayed | High | Mira Chen | Blocked by missing CRM export credentials. |
| Q3 retainer | On track | Medium | Adrian Vale | Scope is almost approved; staffing needs confirmation. |
| Finance portal | Review | Low | Leo Marin | Requirements are under review; permissions are next. |

## Demo Knowledge

| Type | Title | Source | Project |
| --- | --- | --- | --- |
| Decision | Delay Atlas launch by one week | Management meeting | Atlas onboarding |
| Meeting summary | Atlas onboarding blockers | Client success call | Atlas onboarding |
| Note | Q3 retainer priorities | Manager note | Q3 retainer |
| Process | Client document review workflow | Operations handbook | Finance portal |

## Demo Documents

| Document | Type | Status | Project |
| --- | --- | --- | --- |
| Atlas onboarding checklist | Markdown | Summarized | Atlas onboarding |
| Q3 retainer scope | PDF | Summarized | Q3 retainer |
| Finance permissions draft | DOCX | Needs review | Finance portal |

## Demo Risks

| Risk | Severity | Owner | Mitigation |
| --- | --- | --- | --- |
| CRM export credentials still missing | High | Mira Chen | Escalate to customer sponsor and prepare fallback CSV import path. |
| Staffing overlap during Q3 delivery | Medium | Adrian Vale | Confirm allocation before final retainer approval. |
