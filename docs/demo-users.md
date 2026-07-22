# Demo Users

These demo users are available for the frontend demo and can be written into MongoDB with the demo seed script.

Use these credentials in the UI login page.

To create the demo records in MongoDB, start the Novera dependencies and run:

```bash
npm run seed:demo
```

By default, the seed script writes only to:

```text
mongodb://localhost:27017/novera
```

This creates the `novera` database inside your existing local MongoDB without modifying other databases.

| Role | Name | Email | Password | Purpose |
| --- | --- | --- | --- | --- |
| Owner | Olivia Stone | owner@novera.test | DemoPass123! | Full access to organization settings, billing-ready ownership, team management, and all demo data. |
| Administrator | Adrian Vale | admin@novera.test | DemoPass123! | Manages users, integrations, permissions, and organization configuration. |
| Manager | Mira Chen | manager@novera.test | DemoPass123! | Manages projects, knowledge items, documents, risks, and team activity. |
| Member | Leo Marin | member@novera.test | DemoPass123! | Adds notes, decisions, meeting summaries, links, project updates, and documents. |
| Viewer | Vera Holt | viewer@novera.test | DemoPass123! | Read-only access for permission and tenant-isolation demos. |

## Demo Organization

| Field | Value |
| --- | --- |
| Organization name | Acme Studio |
| Industry | Digital agency |
| Workspace slug | acme-studio |

## Demo Notes

- These credentials are intentionally simple for local demos only.
- Do not use these passwords in staging or production.
- The seed script hashes passwords before storing them.
- The Viewer user should be used to test restricted-access behavior.
- The Owner and Administrator users should be used to test organization management.
