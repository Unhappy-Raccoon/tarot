# Database setup

Apply migrations in order before starting the API with a persistent database.

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0001_core.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0002_tarot_readings.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0003_natal_charts.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0004_ai_astrologer.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0005_daily_horoscope.sql
```

The API uses Drizzle ORM for queries. Migrations are plain SQL so they can be applied without a separate migration runner. New schema changes must be added as sequential SQL migrations and reflected in `src/db/schema.ts`.

Migration 0005 adds one daily horoscope per user/local calendar date, calculated transit snapshots and opt-in notification preferences. Notifications default to disabled. The timezone and local delivery time are user-configurable.

When `DATABASE_URL` is absent in development, repositories use in-memory adapters for local preview only. The notification scheduler requires PostgreSQL and a running Telegram Bot process. Production requests require PostgreSQL and do not fall back to memory.
