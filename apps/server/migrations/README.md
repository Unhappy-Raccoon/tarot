# Database setup

Apply migrations in order before starting the API with a persistent database.

From the repository root:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0001_core.sql
```

The API uses Drizzle ORM for queries. The migration is plain SQL so the initial schema can be applied without a separate migration runner. New schema changes must be added as sequential SQL migrations and reflected in `src/db/schema.ts`.

When `DATABASE_URL` is absent in development, the user repository uses an in-memory adapter for local preview only. Production requests require PostgreSQL and do not fall back to memory.
