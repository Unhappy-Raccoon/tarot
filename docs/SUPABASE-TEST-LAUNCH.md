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

## Важный текущий статус — проверено 2026-11-03

Тестовый Supabase project `uayoqicecdtcxouwsprh` уже создан и подключён. Семь миграций применены; повторный CLI dry run не обнаруживает pending migrations. Последний аудит PostgreSQL проверил девять прикладных таблиц, RLS, индексы, ограничения и расширения.

Подтверждённые результаты:
- Все 9 прикладных таблиц существуют, RLS включён на каждой; публичных RLS policies — 0.
- Session Pooler доступен из Supabase Edge Runtime; `DATABASE_URL` автоматически формируется deploy workflow из GitHub Secret `SUPABASE_DB_PASSWORD`. Пароль URL-кодируется и не выводится в лог.
- Edge Functions `api`, `telegram-webhook`, `process-horoscope-notifications` развернуты.
- `/health`, `/api/tarot/spreads` и `/health/ready` возвращают HTTP 200.
- Проверены Telegram/auth/cron secret guards и CORS: неавторизованные запросы и посторонний Origin отклоняются.
- `pg_cron`, `pg_net`, Supabase Vault присутствуют; Cron job запланирован. Последний worker callback вернул HTTP 200 с `sent=0, skipped=0, failed=0` — в тот момент не было пользователей с due notification.
- Node/TypeScript/Deno, серверные unit-тесты, security tests и production build проходят CI.

Проверочные журналы:
- [Deploy Edge Functions и настройка Cron/Vault — #41669561604](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41669561604)
- [Полный DB/RLS/API/Auth/CORS/Cron smoke test — #41669991337](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41669991337)
- [CI — #41671460540](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41671460540)

**Единственный внешний blocker публикации WebApp сейчас — GitHub Pages не включён в настройках репозитория.** Сборка Pages проходит, но `actions/deploy-pages` возвращает HTTP 404 с подсказкой включить Pages. Владелец репозитория должен открыть **Settings → Pages → Build and deployment → Source → GitHub Actions**. После этого нужно повторно запустить guarded Pages publish workflow.

Успешная Pages публикация автоматически вызовет защищённый Supabase endpoint `telegram-webhook/configure`. Он проверит bot token через Telegram `getMe`, установит webhook, bot commands и Mini App menu, затем проверит `getWebhookInfo`. До успешной публикации Pages этот шаг намеренно не запускается.

OpenAI readiness check подтверждает наличие серверной AI configuration, но реальный Responses API запрос ещё не выполнялся. После публикации и входа в WebApp нужно сделать один небольшой тестовый запрос AI. Реальная Telegram авторизация и пользовательские сценарии Таро/натальной карты/гороскопа также пока не проверены сквозным тестом.

Payments / Telegram Stars выключены. Не приглашать внешних тестировщиков до подготовки и проверки privacy notice / terms: приложение сохраняет дату/время/место рождения и текст AI-диалогов.

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

В репозитории открой **Settings → Pages → Build and deployment → Source** и выбери **GitHub Actions**. Это обязательная настройка: пока Pages не включён, `actions/deploy-pages` отвечает HTTP 404. Ожидаемый адрес WebApp — `https://unhappy-raccoon.github.io/tarot/`.

Настройки workflow:
- Node.js: версия из `.nvmrc`.
- Установка: `npm install --no-audit --no-fund`.
- Repository Actions variable `VITE_API_URL=https://<PROJECT_REF>.supabase.co/functions/v1/api`.
- Vite base path `VITE_BASE_PATH=/tarot/`.

Текущий `.github/workflows/pages.yml` собирает WebApp из feature branch; тестовая публикация защищена одноразовым файлом `.github/deploy-requests/publish-pages.txt` со значением `PUBLISH_TO_TEST` и commit message с `[publish-pages]`. Push и PR используют разные concurrency groups, чтобы PR build не отменял публикацию. Workflow проверяет `VITE_API_URL` на соответствие тестовому Supabase project. После успешного deploy Pages workflow автоматически настраивает Telegram webhook и Mini App menu через защищённую Edge Function. Переменная `VITE_API_URL` по умолчанию указывает на API тестового проекта; менять её на другой URL нельзя без согласованного изменения project target.

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

Telegram bot setup сейчас запускается post-deploy шагом Pages workflow после успешной публикации WebApp. Владелец не должен вручную запускать старый локальный `npm run configure:supabase:telegram`: автоматический шаг вызывает защищённый endpoint `/functions/v1/telegram-webhook/configure`, который использует Edge secrets, выполняет Telegram `getMe`, `setWebhook`, `setMyCommands`, `setChatMenuButton` и проверяет `getWebhookInfo`. Результат будет виден в журнале Pages deployment.

## 6. Включить расписание уведомлений

1. Расширения `pg_cron` и `pg_net` и два Vault secrets уже созданы deploy workflow.
2. Workflow создаёт/обновляет Cron job `pcj-horoscope-notifications` с запуском раз в минуту и вызывает `process-horoscope-notifications` с `x-cron-secret`.
3. Последний аудит подтвердил scheduled job, Vault secrets и последний callback HTTP 200: `{\"ok\":true,\"sent\":0,\"skipped\":0,\"failed\":0}`. Для фактической проверки доставки нужно включить notifications в тестовом Telegram-профиле и дождаться due local time.
4. Worker использует атомарный UPDATE для claim пользователя/локальной даты и ограничивает пачку тремя уведомлениями. Ошибка до обращения к Telegram освобождает claim; если результат Telegram send неизвестен, claim сохраняется до истечения 10-минутной lease, чтобы немедленный retry не создал дубль. Exactly-once гарантия внешнего Telegram API невозможна при потере ответа после принятой доставки.

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

1. Включить GitHub Pages в репозитории: **Settings → Pages → Build and deployment → Source → GitHub Actions**. Без этого деплой завершится HTTP 404.
2. После включения Pages дать знать, чтобы повторно запустить guarded Pages deployment. Workflow затем автоматически настроит и проверит Telegram webhook и Mini App menu.
3. После публикации открыть бота `@my_first_tarot_test_bot`, отправить `/start`, запустить Mini App и выполнить первый smoke test пользовательского сценария.
4. Для внешнего тестирования отдельно утвердить privacy notice / terms. Пароли, Telegram token и OpenAI key в чат не присылать.

## Текущее ограничение объёма работ

Кодовые адаптеры Fastify API, Telegram Webhook и Cron worker работают в hosted Supabase Edge Runtime; текущий test project подключён и проходит database/RLS/auth/CORS/Cron smoke test. Supabase secrets устанавливаются защищённым GitHub Actions workflow. GitHub Pages artifact собирается, но публикация блокируется выключенной Pages setting (HTTP 404). После включения Pages остаются Telegram webhook setup, реальная авторизация через `/start`, один тест AI Responses API и пользовательский E2E walkthrough. Ветка не содержит production/test secrets; пароль базы и AI key не публикуются в логах или frontend.
