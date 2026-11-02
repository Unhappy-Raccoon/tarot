# Тестовый запуск

Для выбранной инфраструктуры на Supabase используй актуальную инструкцию:

- [Тестовый запуск Personal Cosmic Journal на Supabase](SUPABASE-TEST-LAUNCH.md)

Старая схема VPS + Docker Compose более не является целевой для тестовой среды. Её файлы `docker-compose.test.yml`, `apps/server/Dockerfile` и `scripts/migrate-test.sh` оставлены в репозитории для локальной/альтернативной Node.js среды, но не являются способом запуска на Supabase.

**Важно:** текущий Node.js/Fastify API, Telegram long polling и in-process scheduler ещё требуют переноса в Supabase Edge Functions, Telegram Webhook и Supabase Cron. Добавленные Supabase migrations подготавливают только PostgreSQL schema и RLS; они сами по себе не означают, что тестовое окружение уже развернуто.
