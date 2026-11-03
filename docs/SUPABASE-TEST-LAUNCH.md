# Тестовый запуск Personal Cosmic Journal на Supabase

## Цель и выбранная архитектура

Для тестового окружения используется Supabase вместо отдельного VPS:

- **Supabase Database (PostgreSQL)** — профили, натальные карты, расклады, история Таро, диалоги AI и ежедневные гороскопы.
- **Supabase Edge Functions** — HTTP API приложения и приём Telegram updates через webhook.
- **Supabase Cron** — запуск обработки ежедневных уведомлений по расписанию.
- **GitHub Pages** — статическая сборка Telegram WebApp по адресу `https://unhappy-raccoon.github.io/tarot/`.
- **Telegram** — тестовый бот `@my_first_tarot_test_bot`.
- **OpenAI API** — генерация ответов астролога и интерпретации гороскопа.

VPS не нужен. Supabase предоставляет управляемую PostgreSQL и serverless-функции, но не запускает произвольный постоянно работающий Docker/Node.js-процесс как VPS.

## Важный текущий статус

В ветке `feat/supabase-edge-runtime` подготовлены Supabase CLI config, PostgreSQL migrations, GitHub Pages workflow, Fastify-inject адаптер для API, Telegram webhook, Cron worker, claim-колонки и тесты security helper. Сборка Node workspace перед deploy создаёт `apps/server/dist`, откуда Edge Functions импортируют текущие серверные модули. Полный live deploy ещё не выполнен; Deno check и проверка работы Fastify/Postgres.js/grammY/Astronomy Engine в hosted Edge Runtime обязательны.

Перед реальным запуском остаются внешняя настройка Supabase/Pages и проверки в hosted runtime:

1. Установить Node.js по `.nvmrc`, выполнить `npm install`, затем `npm run build`. Edge Functions импортируют собранный `apps/server/dist`, поэтому сборка обязательна перед каждым deploy.
2. Выполнить `deno check --config supabase/functions/deno.json ...` и `deno test --config supabase/functions/deno.json supabase/functions/_shared/security.test.ts`. CI запускает эти проверки на ветке.
3. Подключить тестовый Supabase project и применить семь миграций.
4. Настроить secrets, деплой Edge Functions, Telegram Webhook и Cron по разделам ниже.
5. В Supabase Edge Runtime проверить реальную работу Fastify `app.inject()`, PostgreSQL pooler, grammY, OpenAI и Astronomy Engine. Активное CPU-время Edge Function ограничено 2 секундами на запрос; полный лимит и wall-clock timeout зависят от плана. См. [Edge Functions limits](https://supabase.com/docs/guides/functions/limits).
6. Для публичного GitHub Pages deployment задать repository Actions variable `VITE_API_URL` со значением `https://<PROJECT_REF>.supabase.co/functions/v1/api`.

Не считать окружение deployed до реальной публикации и проверки /health/ready, Telegram webhook и Pages.

## 1. Создать Supabase project

1. Зарегистрироваться/войти в [Supabase](https://supabase.com/dashboard).
2. Создать отдельный project для тестовой среды, не использовать production project.
3. Выбрать регион в ЕС, подходящий пользователям и доступный в списке регионов Supabase.
4. Задать надёжный пароль базы данных и сохранить его в менеджере паролей.
5. Дождаться готовности проекта.
6. В Dashboard открыть **Connect** и скопировать **Session pooler** connection string. В нём заменить placeholder паролем БД и URL-encode специальные символы пароля.

Пример формата (не использовать буквально):
```text
postgresql://postgres.<project-ref>:[PASSWORD]@[SESSION-POOLER-HOST]:5432/postgres?sslmode=require
```

**Почему Session Pooler:** сервер использует `postgres.js` через Drizzle. `postgres.js` выполняет pipelining запросов; Supabase предупреждает, что shared Transaction Pooler может зависать или возвращать ответы не тем запросам. `prepare: false` отключает prepared statements, но не pipelining; вариант `max_pipeline: 0` ломает `sql.begin()`, используемый текущим `db.transaction()` при сохранении AI-диалогов. Session mode сохраняет семантику соединения, необходимую этому коду. Для Edge isolate оставлен `DATABASE_POOL_MAX=1`, чтобы ограничить число занятых серверных соединений. Это компромисс для малонагруженной тестовой среды, а не масштабируемая настройка для большого трафика. См. [официальную документацию Supabase по Postgres.js](https://supabase.com/docs/guides/database/postgres-js).

Supabase в общей таблице выбора подключения рекомендует shared Transaction Pooler для serverless/Edge, потому что он лучше распределяет подключения между короткими вызовами. Но конкретно `postgres.js` документированно не поддерживает безопасную работу query pipelining в shared transaction mode, а текущий код использует Drizzle transactions. Поэтому Session Pooler оставлен только для первого тестового smoke test с малой нагрузкой. До приглашения других тестировщиков нужно отдельно заменить DB driver на совместимый с Transaction Pooler и повторить тесты; Session mode может расходовать отдельное PostgreSQL-соединение на каждый тёплый Edge isolate. См. [выбор режима подключения Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).

Не публиковать строку подключения, пароль БД или service-role/secret key в репозитории, WebApp, тикетах или чате.

## 2. Применить миграции Supabase

**Проверка подключения и применение миграций (2026-11-03):** GitHub Actions успешно связал проект `uayoqicecdtcxouwsprh`, выполнил dry run, затем с явным подтверждением применил все семь миграций: `20261102000100_core.sql`–`20261102000700_horoscope_notification_claims.sql`. Журнал [run #41642833963](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41642833963) подтверждает `Applying migration ...` для каждой из семи файлов и завершение `Finished supabase db push`. После удаления одноразового deployment-request marker контрольный read-only run [#41642994353](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41642994353) завершился сообщением `Remote database is up to date`. Таким образом, все семь миграций применены и повторная проверка не обнаружила pending migrations. `--linked` используется явно для адресации связанного удалённого проекта. Edge Functions, runtime secrets и Telegram/Cron ещё не развёрнуты.


Требуется Supabase CLI и авторизация в нём. Из корня репозитория:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push
```

CLI применит семь миграций из `supabase/migrations/` в порядке timestamp:

- core tables и профили;
- расклады Таро;
- натальные карты;
- AI диалоги и дневные лимиты;
- ежедневные гороскопы и настройки уведомлений;
- включение Row Level Security на всех прикладных таблицах;
- атомарный claim уведомлений для Supabase Cron.

Проверить в Supabase Dashboard → Table Editor, что созданы таблицы: `users`, `birth_profiles`, `tarot_readings`, `natal_charts`, `ai_conversations`, `ai_messages`, `ai_daily_usage`, `daily_horoscopes`, `horoscope_preferences`.

RLS включён без публичных политик: пользовательский браузер не должен напрямую читать эти таблицы. Доступ к данным выполняется через проверенный серверный код. Привилегированный ключ никогда не помещается во frontend.

## 3. Настроить Telegram и OpenAI secrets

Нужны:
- токен именно бота `@my_first_tarot_test_bot`, полученный у [@BotFather](https://t.me/BotFather);
- секрет webhook (случайная строка из безопасного генератора; Telegram передаёт её в специальном заголовке);
- `SESSION_SECRET` не короче 32 случайных символов;
- OpenAI API key и выбранная доступная модель;
- URL проекта Supabase;
- GitHub Pages HTTPS URL `https://unhappy-raccoon.github.io/tarot/` и origin `https://unhappy-raccoon.github.io`;
- отдельный `HOROSCOPE_CRON_SECRET` для планировщика.

Секреты Edge Functions задаются через Supabase CLI или Dashboard Secrets, не через файл в Git:

```bash
cp .env.supabase.example .env.supabase
# Заполнить .env.supabase локально, не добавляя его в Git.
supabase secrets set --env-file .env.supabase
```

Файл `.env.supabase` исключён из Git правилом `.env.*`. Команду выполняет владелец проекта локально. Перед отправкой убедись, что в файл не попали публичные настройки вроде `VITE_API_URL`, а только серверные secrets. Не печатай содержимое файла в лог и не передавай его в чат. Официальная инструкция: [Supabase Function secrets](https://supabase.com/docs/guides/functions/secrets).

## 4. Опубликовать WebApp через GitHub Pages

В репозитории открой Settings → Pages и выбери **GitHub Actions** как Build and deployment source. После отдельного утверждения реализации workflow будет собирать WebApp из `apps/web` и публиковать `apps/web/dist`. Для проекта `Unhappy-Raccoon/tarot` ожидаемый адрес — `https://unhappy-raccoon.github.io/tarot/`.

Настройки workflow:
- Node.js: версия из `.nvmrc`.
- Установка: `npm install --no-audit --no-fund`.
- Repository Actions variable `VITE_API_URL=https://<PROJECT_REF>.supabase.co/functions/v1/api`.
- Vite base path `VITE_BASE_PATH=/tarot/`.

Ветка содержит `.github/workflows/pages.yml`: при push она собирает и сохраняет Pages artifact без публикации. Публикация защищена ручным запуском workflow_dispatch с `publish=yes` только из `main`, чтобы feature branch не выкладывала незавершённую версию. В Settings → Pages выбрать **GitHub Actions**. В Settings → Secrets and variables → Actions → Variables добавить `VITE_API_URL` со значением `https://<PROJECT_REF>.supabase.co/functions/v1/api`. После интеграции изменений в main ручной запуск workflow опубликует `apps/web/dist` по адресу `https://unhappy-raccoon.github.io/tarot/`. Передать этот URL как `TELEGRAM_WEBAPP_URL`, а origin без пути — `WEBAPP_ORIGIN=https://unhappy-raccoon.github.io` в Supabase secrets.

## 5. Развернуть Edge Functions

Для развёртывания через GitHub Actions локальный Supabase CLI не требуется. В GitHub → Settings → Secrets and variables → Actions добавь:

**Repository Secrets**
- `SUPABASE_ACCESS_TOKEN` — личный токен Supabase.
- `SUPABASE_DB_PASSWORD` — пароль БД тестового проекта.

**Repository Variable**
- `SUPABASE_PROJECT_ID=uayoqicecdtcxouwsprh`.

Workflow `.github/workflows/deploy-supabase.yml` автоматически запускает безопасный `validate` при изменении самого workflow в ветке `feat/supabase-edge-runtime`. Это нужно, поскольку GitHub показывает ручной `workflow_dispatch` только после появления файла workflow в default branch; мы намеренно пока не меняем `main`. После интеграции workflow в default branch появится возможность запускать все три режима через Actions → Deploy Supabase test environment → Run workflow. Он поддерживает три раздельных режима:

1. `validate` — связывает CLI с ожидаемым test project и показывает pending migrations через dry run; удалённую схему не изменяет.
2. `apply-migrations` — сначала показывает dry run, затем применяет миграции. Для ручного запуска требуется `DEPLOY_TO_TEST`.
3. `deploy-functions` — собирает приложение, выполняет Deno type check и развёртывает три Edge Functions. До запуска этого этапа сначала добавь Runtime Secrets в Supabase Dashboard. Для ручного запуска также требуется `DEPLOY_TO_TEST`.

Поскольку feature workflow пока не интегрирован в default branch, ручной `workflow_dispatch` из GitHub UI ещё не доступен. Для текущей feature-ветки предусмотрен однократный push-trigger через файл-запрос: `.github/deploy-requests/apply-migrations.txt` или `.github/deploy-requests/deploy-functions.txt`, содержащий ровно `DEPLOY_TO_TEST`. Такой файл добавляется отдельным commit только после явного согласия владельца проекта; его добавление само запускает соответствующий изменяющий этап. Обычные обновления workflow по-прежнему запускают только read-only validate.

Workflow жёстко ограничен test project ref `uayoqicecdtcxouwsprh` и веткой `feat/supabase-edge-runtime`. Он не запускается из `main` и не сливает PR. Для CI используется Supabase CLI v2 stable через официальный `supabase/setup-cli` action; это избегает неявного перехода на CLI v3 с изменённым поведением hosted mutations. В CI все mutating commands выполняются с явным `--yes` после ручного выбора соответствующего stage. См. [Supabase CLI v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3).

Runtime Secrets (DATABASE_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, SESSION_SECRET, HOROSCOPE_CRON_SECRET, AI_API_KEY и AI_MODEL) добавляются отдельно в Supabase Dashboard → Edge Functions → Secrets. Не нужно дублировать эти значения в GitHub Actions Secrets, за исключением Supabase Access Token и DB password, нужных workflow.


Из корня репозитория:

```bash
npm install
npm run build
npm run check:supabase
npm run test:supabase
npm run deploy:supabase:functions
```

Команда deploy ещё раз собирает Node workspace и публикует три функции. Требуется установленный и авторизованный Supabase CLI (`supabase login`, `supabase link --project-ref <PROJECT_REF>`).

Для этих функций отключение встроенной JWT-проверки допустимо только потому, что приложение использует собственную Telegram initData validation/session auth, а webhook/cron endpoint защищены отдельными секретами. Нельзя оставлять публичный API без собственной проверки сессии.

URL:
- API: `https://<PROJECT_REF>.supabase.co/functions/v1/api`
- Telegram webhook: `https://<PROJECT_REF>.supabase.co/functions/v1/telegram-webhook`
- Scheduler worker: `https://<PROJECT_REF>.supabase.co/functions/v1/process-horoscope-notifications`

После деплоя Edge Functions выполнить локально `npm run configure:supabase:telegram`. Скрипт читает `.env.supabase`, вызывает Telegram `setWebhook`, `setMyCommands` и `setChatMenuButton`; он не выводит token и secret в лог. Затем проверить `getWebhookInfo` через Telegram Bot API и убедиться, что webhook установлен без ошибок доставки.

## 6. Включить расписание уведомлений

1. В Supabase Dashboard включить расширения `pg_cron` и `pg_net`, если они ещё не включены.
2. В SQL Editor выполнить инструкции из `supabase/cron/schedule-horoscope-notifications.sql.example`: положить `PROJECT_URL` и `HOROSCOPE_CRON_SECRET` в Supabase Vault и создать cron job раз в минуту.
3. Worker использует атомарный UPDATE для claim пользователя/локальной даты и ограничивает пачку тремя уведомлениями. Ошибка до обращения к Telegram освобождает claim; если результат Telegram send неизвестен, claim сохраняется до истечения 10-минутной lease, чтобы немедленный retry не создал дубль. При сетевом сбое после фактической доставки exactly-once гарантия внешнего Telegram API невозможна.
4. Проверить `cron.job`, `cron.job_run_details`, логи Edge Function и отсутствие повторной отправки одного уведомления за локальную дату пользователя.

Supabase рекомендует ограничивать параллельность Cron jobs и длительность каждого задания; worker должен обрабатывать ограниченную порцию пользователей за вызов и корректно продолжать при следующем запуске. См. [Supabase Cron](https://supabase.com/docs/guides/cron).

## 7. Критерии успешного пробного запуска

- Все семь Supabase migrations применены.
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

1. Создать Supabase project и сохранить Project Ref, Database password и Session pooler connection string у себя.
2. Создать/подтвердить токен для `@my_first_tarot_test_bot`.
3. Создать OpenAI API key и выбрать модель.
4. Иметь права администратора/maintainer репозитория, чтобы включить GitHub Pages в Settings → Pages и добавить Actions variable `VITE_API_URL`.
5. Выполнить вход в Supabase CLI на машине, где будет выполняться deploy, либо предоставить доступ через подходящий безопасный интеграционный механизм. Секреты в чат не передавать.

## Текущее ограничение объёма работ

Кодовые адаптеры Fastify API, Telegram Webhook и Cron worker добавлены в `supabase/functions/`; существующие серверные маршруты переиспользуются после сборки в `apps/server/dist`. GitHub Pages workflow и настройки Vite также добавлены. Реальный deploy, проверка runtime совместимости и работа с настоящими секретами не выполнялись: для них требуется отдельный Supabase project, локальная авторизация CLI и заполнение `.env.supabase` владельцем проекта. Ветка не содержит production/test secrets и не создаёт Supabase project от имени пользователя.
