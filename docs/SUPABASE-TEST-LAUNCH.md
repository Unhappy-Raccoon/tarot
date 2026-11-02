# Тестовый запуск Personal Cosmic Journal на Supabase

## Цель и выбранная архитектура

Для тестового окружения используется Supabase вместо отдельного VPS:

- **Supabase Database (PostgreSQL)** — профили, натальные карты, расклады, история Таро, диалоги AI и ежедневные гороскопы.
- **Supabase Edge Functions** — HTTP API приложения и приём Telegram updates через webhook.
- **Supabase Cron** — запуск обработки ежедневных уведомлений по расписанию.
- **Cloudflare Pages** — статическая сборка Telegram WebApp. Собственный домен не обязателен: на первом тесте можно использовать адрес `*.pages.dev`.
- **Telegram** — тестовый бот `@my_first_tarot_test_bot`.
- **OpenAI API** — генерация ответов астролога и интерпретации гороскопа.

VPS не нужен. Supabase предоставляет управляемую PostgreSQL и serverless-функции, но не запускает произвольный постоянно работающий Docker/Node.js-процесс как VPS.

## Важный текущий статус

Подготовлены Supabase CLI config, перенос существующих SQL-миграций и шаблон переменных окружения. **Сам серверный runtime ещё не перенесён на Edge Functions.** Текущий backend в `apps/server` использует Fastify, процесс `listen()`, grammY long polling и `setInterval()` для уведомлений. Эти механизмы нельзя просто запустить внутри Supabase Edge Functions.

Перед реальным запуском необходимо завершить кодовую адаптацию:

1. Перенести HTTP-маршруты из `apps/server/src/app.ts` в Fetch-совместимую Edge Function (сохранить существующие URL, payloads, коды ответов и проверку пользовательской сессии).
2. Убрать запуск Fastify listener из `apps/server/src/index.ts`; API должен экспортировать обработчик запросов Supabase Edge Runtime.
3. Перевести Telegram-бота с long polling на webhook. Edge Function должна принимать Telegram POST updates, проверять заголовок `X-Telegram-Bot-Api-Secret-Token` и передавать update в grammY.
4. Вынести `setMyCommands` и настройку WebApp menu button в однократную операцию настройки webhook, а не выполнять их при каждом update.
5. Перенести текущий минутный scheduler из `setInterval()` в Supabase Cron. Cron должен вызывать защищённую Edge Function, которая обрабатывает только наступившие уведомления. Обязательны атомарное резервирование/claim записей и идемпотентность, чтобы повторный вызов не отправлял дубликаты.
6. Проверить совместимость `astronomy-engine`, grammY, OpenAI adapter, Drizzle и Postgres.js с Supabase Edge Runtime (Deno). Заменить Node-only crypto/Buffer участки на Web Crypto или подтвердить их совместимость в runtime tests.
7. Для подключения к PostgreSQL из Edge Runtime использовать **Transaction pooler** Supabase (обычно port 6543), SSL и `prepare: false` для Postgres.js. Брать hostname и username только из Connect dialog проекта; не собирать connection string вручную.
8. Переключить WebApp `VITE_API_URL` на URL API Edge Function и проверить CORS/preflight для Cloudflare Pages origin.
9. Проверить вычисления Astronomy Engine в Edge Runtime: активное CPU-время Edge Function ограничено 2 секундами на запрос. При превышении потребуется оптимизация или перенос тяжёлых вычислений в иной runtime. У Edge Functions также есть лимиты wall-clock duration и памяти; ориентироваться нужно на актуальный план проекта. См. [Edge Functions limits](https://supabase.com/docs/guides/functions/limits).

Это обязательная часть миграции, а не уже выполненная функция. Не отмечать окружение как deployed до успешной публикации и проверки этих Edge Functions.

## 1. Создать Supabase project

1. Зарегистрироваться/войти в [Supabase](https://supabase.com/dashboard).
2. Создать отдельный project для тестовой среды, не использовать production project.
3. Выбрать регион в ЕС, подходящий пользователям и доступный в списке регионов Supabase.
4. Задать надёжный пароль базы данных и сохранить его в менеджере паролей.
5. Дождаться готовности проекта.
6. В Dashboard открыть **Connect** и скопировать **Transaction pooler** connection string. В нём заменить placeholder паролем БД и URL-encode специальные символы пароля.

Пример формата (не использовать буквально):
```text
postgresql://postgres.<project-ref>:[PASSWORD]@[POOLER-HOST]:6543/postgres?sslmode=require
```

Не публиковать строку подключения, пароль БД или service-role/secret key в репозитории, WebApp, тикетах или чате.

## 2. Применить миграции Supabase

Требуется Supabase CLI и авторизация в нём. Из корня репозитория:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

CLI применит миграции из `supabase/migrations/` в порядке timestamp:

- core tables и профили;
- расклады Таро;
- натальные карты;
- AI диалоги и дневные лимиты;
- ежедневные гороскопы и настройки уведомлений;
- включение Row Level Security на всех прикладных таблицах.

Проверить в Supabase Dashboard → Table Editor, что созданы таблицы: `users`, `birth_profiles`, `tarot_readings`, `natal_charts`, `ai_conversations`, `ai_messages`, `ai_daily_usage`, `daily_horoscopes`, `horoscope_preferences`.

RLS включён без публичных политик: пользовательский браузер не должен напрямую читать эти таблицы. Доступ к данным выполняется через проверенный серверный код. Привилегированный ключ никогда не помещается во frontend.

## 3. Настроить Telegram и OpenAI secrets

Нужны:
- токен именно бота `@my_first_tarot_test_bot`, полученный у [@BotFather](https://t.me/BotFather);
- секрет webhook (случайная строка из безопасного генератора; Telegram передаёт её в специальном заголовке);
- `SESSION_SECRET` не короче 32 случайных символов;
- OpenAI API key и выбранная доступная модель;
- WebApp HTTPS URL и его origin.

Секреты Edge Functions задаются через Supabase CLI или Dashboard Secrets, не через файл в Git:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=... TELEGRAM_WEBHOOK_SECRET=... SESSION_SECRET=... AI_PROVIDER=openai AI_API_KEY=... AI_MODEL=... AI_BASE_URL=https://api.openai.com/v1 TELEGRAM_WEBAPP_URL=https://<pages-project>.pages.dev WEBAPP_ORIGIN=https://<pages-project>.pages.dev HOROSCOPE_DEFAULT_TIME_ZONE=Europe/Tallinn
```

Команду выполняет владелец проекта локально в своём терминале, подставляя реальные значения. Не вставлять реальные секреты в историю публичного shell, CI logs или чат. При вводе секретов предпочтительно использовать защищённый prompt/secret manager.

## 4. Опубликовать WebApp

Создать Cloudflare Pages project из GitHub-репозитория. До первого live запуска использовать подготовленную ветку миграции/её итоговую ветку после завершения Edge API port; не выбирать `main`, пока цепочка PR не интегрирована.

Настройки сборки:
- Root directory: `/`
- Build command: `npm install --no-audit --no-fund && npm run build --workspace=@pcj/web`
- Build output directory: `apps/web/dist`
- Node version: `26.13.0`
- Build environment variable: `VITE_API_URL=https://<PROJECT_REF>.supabase.co/functions/v1/api`

После публикации Cloudflare Pages выдаст HTTPS URL вида `https://<project>.pages.dev`. Его необходимо установить как `TELEGRAM_WEBAPP_URL` и соответствующий origin — как `WEBAPP_ORIGIN` в Supabase secrets. Собственный домен необязателен для первого теста.

## 5. Развернуть Edge Functions

После реализации и тестирования функций:

```bash
supabase functions deploy api --no-verify-jwt
supabase functions deploy telegram-webhook --no-verify-jwt
supabase functions deploy process-horoscope-notifications --no-verify-jwt
```

Для этих функций отключение встроенной JWT-проверки допустимо только потому, что приложение использует собственную Telegram initData validation/session auth, а webhook/cron endpoint защищены отдельными секретами. Нельзя оставлять публичный API без собственной проверки сессии.

URL:
- API: `https://<PROJECT_REF>.supabase.co/functions/v1/api`
- Telegram webhook: `https://<PROJECT_REF>.supabase.co/functions/v1/telegram-webhook`
- Scheduler worker: `https://<PROJECT_REF>.supabase.co/functions/v1/process-horoscope-notifications`

Настроить Telegram `setWebhook` на URL webhook-функции, передав `secret_token`, совпадающий с `TELEGRAM_WEBHOOK_SECRET`. После этого убедиться через Telegram Bot API `getWebhookInfo`, что webhook установлен и нет ошибок доставки.

## 6. Включить расписание уведомлений

1. В Supabase Dashboard включить расширения `pg_cron` и `pg_net`, если они ещё не включены.
2. Создать Supabase Cron job с интервалом 1 минута, вызывающий `process-horoscope-notifications`.
3. Для HTTP вызова использовать секрет из Supabase Vault или другой защищённый серверный механизм; не хранить service-role key открытым текстом в SQL-файле или репозитории.
4. Проверить `cron.job` и `cron.job_run_details`, логи Edge Function и отсутствие повторной отправки одного уведомления за локальную дату пользователя.

Supabase рекомендует ограничивать параллельность Cron jobs и длительность каждого задания; worker должен обрабатывать ограниченную порцию пользователей за вызов и корректно продолжать при следующем запуске. См. [Supabase Cron](https://supabase.com/docs/guides/cron).

## 7. Критерии успешного пробного запуска

- Все шесть Supabase migrations применены.
- RLS включён на всех пользовательских таблицах; anon frontend не может читать персональные данные напрямую.
- Edge API опубликован, CORS разрешает только актуальный WebApp origin, Telegram session auth работает.
- Telegram webhook получает updates и не принимает запросы без верного secret token.
- Бот отвечает на `/start`, `/app`, `/help` и открывает WebApp.
- WebApp загружается по HTTPS и использует Supabase Edge API.
- Supabase Cron запускает worker; тестовое уведомление отправляется только при включённом пользователем opt-in.
- AI endpoint выполняет тестовый запрос выбранной модели и сохраняет запись в PostgreSQL.
- Нет секретов в Git, frontend bundle или логах.

После достижения этих критериев тестовая инфраструктура считается запущенной. Полная проверка пользовательских сценариев Таро, натальной карты, AI-астролога и гороскопа выполняется отдельной следующей итерацией по команде пользователя.

## 8. Что требуется от владельца проекта

1. Создать Supabase project и сохранить Project Ref, Database password и Transaction pooler connection string у себя.
2. Создать/подтвердить токен для `@my_first_tarot_test_bot`.
3. Создать OpenAI API key и выбрать модель.
4. Иметь аккаунт Cloudflare Pages (собственный домен не обязателен).
5. Выполнить вход в Supabase CLI на машине, где будет выполняться deploy, либо предоставить доступ через подходящий безопасный интеграционный механизм. Секреты в чат не передавать.

## Текущее ограничение объёма работ

Эта инструкция и SQL миграции подготавливают Supabase database target. Полный перенос Fastify API, grammY long polling и локального scheduler в Edge Functions/Webhook/Cron остаётся обязательной разработкой до фактического пробного запуска. Ветка не содержит production secrets и не создаёт Supabase project от имени пользователя.
