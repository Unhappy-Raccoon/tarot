#!/bin/sh
set -eu

COMPOSE="docker compose --env-file .env.test -f docker-compose.test.yml"

for migration in \
  apps/server/migrations/0001_core.sql \
  apps/server/migrations/0002_tarot_readings.sql \
  apps/server/migrations/0003_natal_charts.sql \
  apps/server/migrations/0004_ai_astrologer.sql \
  apps/server/migrations/0005_daily_horoscope.sql
do
  printf 'Applying %s\n' "$migration"
  $COMPOSE exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < "$migration"
done

printf 'All MVP migrations applied.\n'
