# Database setup

Apply migrations in order before starting the API with a persistent database.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0001_core.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0002_tarot_readings.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0003_natal_charts.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0004_ai_astrologer.sql
```

The API uses Drizzle ORM for queries. Migrations are plain SQL so they can be applied without a separate migration runner. New schema changes must be added as sequential SQL migrations and reflected in `src/db/schema.ts`.

When `DATABASE_URL` is absent in development, repositories use in-memory adapters for local preview only. Production requests require PostgreSQL and do not fall back to memory.
