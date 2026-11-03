## 2026-11-03 — GitHub Actions deployment for the Supabase test project
- Repository Actions Secrets (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) and Repository Variable (`SUPABASE_PROJECT_ID`) were configured by the owner.
- First hosted `validate` run [#41641692329](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41641692329) succeeded: Supabase CLI v2.122.1 authenticated, linked test project `uayoqicecdtcxouwsprh`, connected to remote Postgres and completed a read-only dry run listing all seven pending migrations. No migration was applied and no Edge Function was deployed.
- Migration commands now pass `--linked` explicitly to guard the remote target against CLI default changes.


- Added `.github/workflows/deploy-supabase.yml` with three manual stages: `validate` (link project + migration dry run), `apply-migrations`, and `deploy-functions`.
- The workflow is restricted to `feat/supabase-edge-runtime` and the confirmed test Project Ref `uayoqicecdtcxouwsprh`; write stages require the explicit typed confirmation `DEPLOY_TO_TEST`.
- CI needs only two GitHub Actions Secrets (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) and one Repository Variable (`SUPABASE_PROJECT_ID`). Application secrets are configured directly in Supabase Dashboard, not duplicated in GitHub.
- The workflow uses the official Supabase CLI setup action pinned to the stable v2 channel, avoiding the CLI v3 hosted-mutation behavior change until it is separately reviewed.
- No migrations, secrets, functions or Pages were deployed by adding this workflow. The next operation is the read-only `validate` stage after credentials are stored in GitHub.

## 2026-11-02 — Supabase database pooler compatibility correction

- Runtime review found that the earlier runbook recommended Supabase shared Transaction Pooler for `postgres.js`. Supabase documents that its pipelining can hang or mismatch responses in transaction mode; disabling prepared statements does not disable pipelining, while `max_pipeline: 0` breaks `sql.begin()` used by the AI conversation transaction.
- Updated the test deployment to use Session Pooler (port 5432) and kept `DATABASE_POOL_MAX=1` per Edge isolate. This is a constrained test-environment tradeoff; hosted smoke tests remain required before launch or increased traffic.

## 2026-11-02 — Supabase Edge runtime и GitHub Pages (код готов к review; hosted smoke test ожидает окружения)

- Создана отдельная ветка `feat/supabase-edge-runtime` поверх утверждённой ветки Supabase; предыдущие PR и `main` не являются базой изменений этой итерации.
- В Vite добавлен configurable base path; workflow GitHub Pages собирает артефакт из `apps/web/dist`, но публикация защищена ручным dispatch с `publish=yes` только из `main`.
- Добавлен Supabase Edge API adapter: существующий Fastify app запускается без listener и обслуживает запросы через `app.inject()`; серверные модули подготавливаются сборкой и копируются внутрь `supabase/functions/_shared/server`.
- Добавлены Telegram webhook с проверкой `X-Telegram-Bot-Api-Secret-Token` и скрипт однократной настройки webhook/команд/кнопки Mini App.
- Добавлен Cron worker для opt-in уведомлений. Миграция `20261102000700_horoscope_notification_claims.sql` добавляет atomic claim fields; worker ограничивает batch тремя пользователями. Если исход Telegram send не определён, claim не освобождается немедленно.
- Добавлены Deno config, CI type-check/security unit tests и скрипты build/check/deploy.
- Live deploy не выполнялся: Supabase project, секреты, CLI auth и Pages Actions settings ещё не подключены. Совместимость Fastify/Postgres.js/grammY/Astronomy Engine на hosted Edge Runtime требует smoke-проверки; лимит CPU Edge Function — 2 секунды на запрос.
- CI на HEAD `30a98eddce6fcde9e8c6ed06f9d2a20081d4be42` прошёл полностью, включая Node typecheck/unit tests/build, Deno check/security tests, API Docker image и Compose validation. Pages build artifact создан, но не опубликован.
- Main branch audit: два helper-файла были случайно добавлены на `main` в ходе предыдущего GitHub write вызова и сразу удалены двумя последующими revert commits. Текущая файловая версия `main` этих файлов не содержит, однако add/delete commits остаются в истории. Feature implementation на `main` не сливалась.
- Ветка и PR остаются отдельными от `main`; никакие PR не сливались.

## 2026-11-02 — Hosting architecture approved: GitHub Pages + Supabase

- Пользователь утвердил GitHub Pages для статического Telegram WebApp и Supabase для PostgreSQL, Edge Functions и Cron.
- VPS, Cloudflare и собственный домен не требуются для первой тестовой версии.
- Утверждение архитектуры не является разрешением начать реализацию следующей итерации. GitHub Pages workflow, Vite base path и Edge API/Webhook/Cron port ожидают отдельной команды.
- PR #6 отмечен Ready for review; слияние не выполнялось. Ветка и PR #5/main не изменялись.

## 2026-11-02 — Подготовка целевого размещения на Supabase

- Создана отдельная ветка `feat/supabase-test-environment` от утверждённой технической подготовки; предыдущие PR и `main` не изменяются.
- Добавлены Supabase CLI config и перенос PostgreSQL migrations 0001–0005 в `supabase/migrations/`.
- Добавлена отдельная migration для включения RLS на прикладных таблицах; публичный frontend не должен иметь прямого доступа к пользовательским данным.
- Добавлен `.env.supabase.example`, настройка Postgres.js для Supabase Transaction pooler (`prepare: false`, управляемый размер пула), новая инструкция `docs/SUPABASE-TEST-LAUNCH.md`.
- Старый VPS/Docker runbook помечен как нецелевой; Docker Compose и Dockerfile оставлены для альтернативной локальной/Node.js среды.
- Важно: Edge API, grammY webhook и Cron worker ещё не перенесены. Живое развёртывание пока невозможно до завершения этого runtime port и получения внешних ключей/URL.
- VPS, Cloudflare и собственный домен не обязательны: Supabase предоставляет project API URL, GitHub Pages — HTTPS `github.io` адрес.

## 2026-11-02 — Стабилизация и подготовка тестового запуска: утверждено пользователем

- Пользователь утвердил техническую подготовку MVP к тестовому запуску.
- Утверждение зафиксировано 2026-11-02; PR #5 переведён в Ready for review, слияние не выполнялось.
- CI на предыдущем функциональном HEAD прошёл: typecheck, server unit tests, workspace production build, API Docker image build и Docker Compose validation.
- Реальный тестовый deployment ещё не выполнен: ожидаются отдельные Telegram/AI credentials, HTTPS-домены и доступ к хостингу.
- Монетизация и Telegram Stars не входят в этап. Сквозные пользовательские сценарии начинаются только после успешного запуска тестового окружения и отдельной команды пользователя.

## 2026-11-02 — Стабилизация и подготовка тестового запуска (техническая подготовка готова; live deployment ожидает окружения)

- Создана отдельная ветка `feat/mvp-test-readiness` поверх утверждённой ветки `feat/daily-horoscope`; предыдущие PR и `main` не изменяются.
- Добавлена строгая проверка обязательной production-конфигурации до запуска API.
- Добавлен readiness endpoint, который проверяет доступность PostgreSQL, наличие таблиц миграций 0001–0005, Telegram Bot, сессию, HTTPS WebApp origin и AI provider.
- Добавлены Dockerfile API, тестовый Compose stack с PostgreSQL и скрипт последовательного применения миграций.
- CI дополнен тестами runtime-конфигурации, сборкой API контейнера и проверкой Compose-конфигурации.
- Финальный HEAD `4b1d643dc992835a33d05ea79b834d9b9a29e35c`: push CI и PR CI завершились успешно (typecheck, server unit tests, workspace build, production API Docker build, Compose validation).
- Добавлен `.dockerignore`; тестовые контейнеры получают только необходимые им переменные окружения, а локальные `.env` исключены из Docker build context.
- Монетизация не входит в этап. Сквозные пользовательские сценарии будут проверяться отдельной итерацией после успешного запуска тестового окружения.
- Реальное развёртывание пока не выполнено: требуются секреты Telegram/AI, домены HTTPS и доступ к выбранному хостингу.

# Changelog

## 2026-11-02 — Ежедневный персональный гороскоп: утверждено пользователем

- Пользователь утвердил функциональную итерацию после успешных CI push и pull_request на последнем функциональном HEAD.
- PR №4 переведён из Draft в Ready for review; слияние не выполнялось.
- Реальные AI API-вызовы и Telegram-доставка требуют серверных credentials и production deployment и отдельно не тестировались.


## 2026-11-02 — Ежедневный персональный гороскоп: первая функциональная итерация

- Создана feature-ветка `feat/daily-horoscope` от утверждённой реализации AI-астролога; основная ветка и существующие PR не изменялись.
- Astronomy Engine рассчитывает 10 тропических геоцентрических транзитных долгот на 12:00 локальной даты пользователя.
- Добавлена оценка прямого/ретроградного движения Меркурия—Плутона и расчёт пяти видов мажорных транзитно-натальных аспектов с документированными орбисами.
- Натальные градусные аспекты используются только при точных долготах; date-only/ambiguous-time не создают фиктивных аспектов.
- AI получает рассчитанные данные для символической персональной трактовки; ежедневная запись кешируется по пользователю и локальной дате.
- Добавлены PostgreSQL-схемы и миграция `0005_daily_horoscope.sql` для гороскопов, транзитного снимка и настроек уведомлений.
- Добавлены API today/history/preferences и история ежедневных записей.
- Добавлен WebApp-экран с трактовкой, транзитами, аспектами, историей и настройками времени/часового пояса.
- Главная карточка «Гороскоп дня» ведёт к новой функции.
- Добавлен opt-in Telegram notification scheduler с локальным временем, выключенными по умолчанию уведомлениями и повторной попыткой после неудачной доставки.
- Добавлены regression/API tests для транзитов, timezone, aspect gating, кеширования, истории и валидации настроек.
- CI дополнен тестовыми файлами и запускается для ветки `feat/daily-horoscope`.
- Ограничения: live AI generation и Telegram delivery не тестировались без production secrets; scheduler пока однопроцессный; независимая сверка эфемерид перед production обязательна.
- Статус итерации: реализация готовится к CI и пользовательскому ревью; не утверждена и не слита.


## 2026-11-02 — AI-астролог: утверждено пользователем

- Функциональная итерация AI-астролога утверждена пользователем после успешного CI (19 тестов, typecheck и production build).
- Draft PR №3 переведён в Ready for review; изменения не слиты в основную ветку.

## 2026-11-02 — AI-астролог: первая функциональная итерация

- Добавлен provider adapter для OpenAI Responses API; секретный ключ и модель читаются только из server environment.
- Добавлены status, chat, list/load/delete conversation endpoints.
- Добавлены server-side сценарии: отношения, потенциал, энергия недели, натальная карта.
- System instructions ограничивают астролога символической саморефлексией, запрещают выдумывать недоступные положения и не поощряют фаталистичные прогнозы.
- В контекст включаются рассчитанные знаки планет и Асцендент при наличии; сырые дата/время/место/координаты рождения из профиля не передаются модели.
- Добавлены PostgreSQL-таблицы диалогов, сообщений и дневного usage; миграция `0004_ai_astrologer.sql`.
- История диалогов сохраняется, загружается и может быть удалена пользователем.
- Реализован атомарный дневной лимит с резервированием сообщения и освобождением резерва при ошибке провайдера.
- Добавлены ограничения длины сообщения, глубины истории, output tokens и времени запроса.
- В WebApp реализован чат с восстановлением последнего диалога, историей, созданием/удалением диалогов и тематическими сценариями.
- В браузерном preview AI-запросы отключены; для чата нужна авторизованная Telegram-сессия.
- Конфигурационные значения по умолчанию Free/Premium — 5/50 сообщений в UTC-день; это временные значения и требуют отдельного утверждения.
- Добавлены unit tests с fake provider; внешние API-запросы в CI не выполняются.
- Live provider не активирован: AI_API_KEY и AI_MODEL не предоставлены серверному окружению.


## 2026-11-02 — Натальная карта: утверждено пользователем

- Функциональная итерация натальной карты утверждена пользователем после успешного CI.
- Draft PR №2 переведён в Ready for review; слияние в основную ветку не выполнялось.

## 2026-11-02 — Натальная карта: расчётное ядро и подключение UI

- Добавлен расчёт тропических геоцентрических положений Солнца, Луны, Меркурия, Венеры, Марса, Юпитера, Сатурна, Урана, Нептуна и Плутона через Astronomy Engine.
- Реализовано преобразование местного времени в UTC по IANA timezone, включая DST gaps и повторяющиеся часы.
- При неизвестном времени рассчитывается временной интервал без подстановки вымышленного полудня; знаки показываются только если они стабильны во всём интервале.
- Асцендент и дома не рассчитываются без точного момента рождения и координат.
- Добавлен расчёт Асцендента по пересечению эклиптики с восточным горизонтом и система домов Whole Sign.
- Добавлены поля широты/долготы к профилю рождения и миграция `0003_natal_charts.sql`.
- В Профиле добавлено редактирование даты, времени, часового пояса, города и координат рождения для уже зарегистрированных пользователей.
- Добавлено сохранение карты в PostgreSQL с кешированием по fingerprint исходных данных и версии алгоритма.
- Добавлен API `POST /api/astrology/natal-chart`.
- Экран Натальной карты подключён к API: реальный зодиакальный круг, положения 10 объектов, точность/неопределённость, ASC и дома при достаточных данных.
- Добавлены тесты часовых поясов, DST, солнечного знака, date-only режима и условий расчёта Асцендента.
- Ограничение: автоматическое геокодирование города не подключено; координаты можно указать вручную. Выбор провайдера геокодирования требует отдельного решения.
- Ограничение: для домов пока используется Whole Sign; изменение системы домов потребует отдельного согласования и контрольной валидации.

## 2026-11-02 — Функциональная итерация Таро

- Добавлен каталог классической колоды из 78 карт: 22 Старших и 56 Младших Арканов.
- Добавлен серверный механизм случайной выборки на `crypto.randomInt`, без повторяющихся карт в пределах одного расклада.
- Реализованы три согласованных расклада: карта дня; прошлое—настоящее—будущее; любовь и отношения.
- Добавлены API для каталога раскладов, создания, просмотра и списка истории раскладов.
- Добавлено сохранение раскладов в PostgreSQL и in-memory preview adapter для разработки.
- Для карты дня введено правило одного сохранённого результата на пользователя за UTC-день; повторное открытие возвращает существующую карту.
- Результат открывается по одной карте с CSS 3D flip; трактовки и вопросы для саморефлексии встроены в каталог.
- Журнал подключён к реальной истории Таро; будущие типы записей показывают пустые состояния вместо фиктивных материалов.
- Добавлены unit tests для каталога, числа карт, уникальности выборки и текстов раскладов.
- GitHub Actions после функциональной итерации: npm install, typecheck, unit tests и production build — успешно.
- Ограничения: трактовки статические, AI не используется; ориентация карт пока только прямая; день карты пока считается по UTC.

## 2026-11-02 — Этап 5: утверждённые UI-разделы WebApp

- Реализованы отдельные компоненты экранов: Главная, выбор расклада Таро, результат, Натальная карта, AI-астролог, Журнал, Профиль и Premium.
- Добавлена единая нижняя навигация и переходы между экранами.
- Главная приведена к утверждённой композиции: приветствие, ежедневная карта с 3D flip, гороскоп дня, три быстрых действия и серия дней.
- Добавлены табы «Карта / Положения» для натальной карты и фильтры журнала.
- Тарифы не содержат выдуманных цен; оформление Premium отключено до интеграции Telegram Stars.
- Все экраны используют общие токены палитры: ночной фон, молочный текст, приглушённое золото; фиолетовый остаётся вторичным фоновым оттенком.
- GitHub Actions: typecheck, Telegram initData tests и production build — успешно.

## 2026-11-02 — Этап 5: Telegram Bot и WebApp foundation

- Создана feature-ветка `feat/telegram-webapp-foundation` от утверждённой основы `setup/project-foundation`.
- Добавлен Telegram Bot на grammY: /start, /app, /help, inline WebApp launch button и кнопка меню Mini App при наличии HTTPS URL.
- Добавлена проверка Telegram Mini App initData на backend (HMAC-SHA-256, auth_date freshness).
- Добавлены подписанные серверные сессии и API профиля.
- Добавлено сохранение onboarding-профиля через PostgreSQL/Drizzle; в development без DATABASE_URL используется только временное in-memory хранилище.
- Добавлена SQL-миграция пользователей и данных рождения.
- Добавлен WebApp onboarding с необязательными временем, местом рождения и IANA timezone.
- Добавлены unit tests для Telegram initData validation.
- Добавлен GitHub Actions workflow: typecheck, Telegram auth tests, production build.
- Telegram Bot не запущен против реального аккаунта: токен не предоставлен через безопасные переменные окружения.
- Реальное тестирование Telegram Mini App требует публичного HTTPS deployment и настройки переменных окружения.



- Added `.github/workflows/deploy-supabase.yml` with three manual stages: `validate` (link project + migration dry run), `apply-migrations`, and `deploy-functions`.
- The workflow is restricted to `feat/supabase-edge-runtime` and the confirmed test Project Ref `uayoqicecdtcxouwsprh`; write stages require the explicit typed confirmation `DEPLOY_TO_TEST`.
- CI needs only two GitHub Actions Secrets (`SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`) and one Repository Variable (`SUPABASE_PROJECT_ID`). Application secrets are configured directly in Supabase Dashboard, not duplicated in GitHub.
- The workflow uses the official Supabase CLI setup action pinned to the stable v2 channel, avoiding the CLI v3 hosted-mutation behavior change until it is separately reviewed.
- No migrations, secrets, functions or Pages were deployed by adding this workflow. The next operation is the read-only `validate` stage after credentials are stored in GitHub.

## 2026-11-02 — Supabase database pooler compatibility correction

- Runtime review found that the earlier runbook recommended Supabase shared Transaction Pooler for `postgres.js`. Supabase documents that its pipelining can hang or mismatch responses in transaction mode; disabling prepared statements does not disable pipelining, while `max_pipeline: 0` breaks `sql.begin()` used by the AI conversation transaction.
- Updated the test deployment to use Session Pooler (port 5432) and kept `DATABASE_POOL_MAX=1` per Edge isolate. This is a constrained test-environment tradeoff; hosted smoke tests remain required before launch or increased traffic.

## 2026-11-02 — Supabase Edge runtime и GitHub Pages (код готов к review; hosted smoke test ожидает окружения)

- Создана отдельная ветка `feat/supabase-edge-runtime` поверх утверждённой ветки Supabase; предыдущие PR и `main` не являются базой изменений этой итерации.
- В Vite добавлен configurable base path; workflow GitHub Pages собирает артефакт из `apps/web/dist`, но публикация защищена ручным dispatch с `publish=yes` только из `main`.
- Добавлен Supabase Edge API adapter: существующий Fastify app запускается без listener и обслуживает запросы через `app.inject()`; серверные модули подготавливаются сборкой и копируются внутрь `supabase/functions/_shared/server`.
- Добавлены Telegram webhook с проверкой `X-Telegram-Bot-Api-Secret-Token` и скрипт однократной настройки webhook/команд/кнопки Mini App.
- Добавлен Cron worker для opt-in уведомлений. Миграция `20261102000700_horoscope_notification_claims.sql` добавляет atomic claim fields; worker ограничивает batch тремя пользователями. Если исход Telegram send не определён, claim не освобождается немедленно.
- Добавлены Deno config, CI type-check/security unit tests и скрипты build/check/deploy.
- Live deploy не выполнялся: Supabase project, секреты, CLI auth и Pages Actions settings ещё не подключены. Совместимость Fastify/Postgres.js/grammY/Astronomy Engine на hosted Edge Runtime требует smoke-проверки; лимит CPU Edge Function — 2 секунды на запрос.
- CI на HEAD `30a98eddce6fcde9e8c6ed06f9d2a20081d4be42` прошёл полностью, включая Node typecheck/unit tests/build, Deno check/security tests, API Docker image и Compose validation. Pages build artifact создан, но не опубликован.
- Main branch audit: два helper-файла были случайно добавлены на `main` в ходе предыдущего GitHub write вызова и сразу удалены двумя последующими revert commits. Текущая файловая версия `main` этих файлов не содержит, однако add/delete commits остаются в истории. Feature implementation на `main` не сливалась.
- Ветка и PR остаются отдельными от `main`; никакие PR не сливались.

## 2026-11-02 — Hosting architecture approved: GitHub Pages + Supabase

- Пользователь утвердил GitHub Pages для статического Telegram WebApp и Supabase для PostgreSQL, Edge Functions и Cron.
- VPS, Cloudflare и собственный домен не требуются для первой тестовой версии.
- Утверждение архитектуры не является разрешением начать реализацию следующей итерации. GitHub Pages workflow, Vite base path и Edge API/Webhook/Cron port ожидают отдельной команды.
- PR #6 отмечен Ready for review; слияние не выполнялось. Ветка и PR #5/main не изменялись.

## 2026-11-02 — Подготовка целевого размещения на Supabase

- Создана отдельная ветка `feat/supabase-test-environment` от утверждённой технической подготовки; предыдущие PR и `main` не изменяются.
- Добавлены Supabase CLI config и перенос PostgreSQL migrations 0001–0005 в `supabase/migrations/`.
- Добавлена отдельная migration для включения RLS на прикладных таблицах; публичный frontend не должен иметь прямого доступа к пользовательским данным.
- Добавлен `.env.supabase.example`, настройка Postgres.js для Supabase Transaction pooler (`prepare: false`, управляемый размер пула), новая инструкция `docs/SUPABASE-TEST-LAUNCH.md`.
- Старый VPS/Docker runbook помечен как нецелевой; Docker Compose и Dockerfile оставлены для альтернативной локальной/Node.js среды.
- Важно: Edge API, grammY webhook и Cron worker ещё не перенесены. Живое развёртывание пока невозможно до завершения этого runtime port и получения внешних ключей/URL.
- VPS, Cloudflare и собственный домен не обязательны: Supabase предоставляет project API URL, GitHub Pages — HTTPS `github.io` адрес.

## 2026-11-02 — Стабилизация и подготовка тестового запуска: утверждено пользователем

- Пользователь утвердил техническую подготовку MVP к тестовому запуску.
- Утверждение зафиксировано 2026-11-02; PR #5 переведён в Ready for review, слияние не выполнялось.
- CI на предыдущем функциональном HEAD прошёл: typecheck, server unit tests, workspace production build, API Docker image build и Docker Compose validation.
- Реальный тестовый deployment ещё не выполнен: ожидаются отдельные Telegram/AI credentials, HTTPS-домены и доступ к хостингу.
- Монетизация и Telegram Stars не входят в этап. Сквозные пользовательские сценарии начинаются только после успешного запуска тестового окружения и отдельной команды пользователя.

## 2026-11-02 — Стабилизация и подготовка тестового запуска (техническая подготовка готова; live deployment ожидает окружения)

- Создана отдельная ветка `feat/mvp-test-readiness` поверх утверждённой ветки `feat/daily-horoscope`; предыдущие PR и `main` не изменяются.
- Добавлена строгая проверка обязательной production-конфигурации до запуска API.
- Добавлен readiness endpoint, который проверяет доступность PostgreSQL, наличие таблиц миграций 0001–0005, Telegram Bot, сессию, HTTPS WebApp origin и AI provider.
- Добавлены Dockerfile API, тестовый Compose stack с PostgreSQL и скрипт последовательного применения миграций.
- CI дополнен тестами runtime-конфигурации, сборкой API контейнера и проверкой Compose-конфигурации.
- Финальный HEAD `4b1d643dc992835a33d05ea79b834d9b9a29e35c`: push CI и PR CI завершились успешно (typecheck, server unit tests, workspace build, production API Docker build, Compose validation).
- Добавлен `.dockerignore`; тестовые контейнеры получают только необходимые им переменные окружения, а локальные `.env` исключены из Docker build context.
- Монетизация не входит в этап. Сквозные пользовательские сценарии будут проверяться отдельной итерацией после успешного запуска тестового окружения.
- Реальное развёртывание пока не выполнено: требуются секреты Telegram/AI, домены HTTPS и доступ к выбранному хостингу.

# Changelog

## 2026-11-02 — Ежедневный персональный гороскоп: утверждено пользователем

- Пользователь утвердил функциональную итерацию после успешных CI push и pull_request на последнем функциональном HEAD.
- PR №4 переведён из Draft в Ready for review; слияние не выполнялось.
- Реальные AI API-вызовы и Telegram-доставка требуют серверных credentials и production deployment и отдельно не тестировались.


## 2026-11-02 — Ежедневный персональный гороскоп: первая функциональная итерация

- Создана feature-ветка `feat/daily-horoscope` от утверждённой реализации AI-астролога; основная ветка и существующие PR не изменялись.
- Astronomy Engine рассчитывает 10 тропических геоцентрических транзитных долгот на 12:00 локальной даты пользователя.
- Добавлена оценка прямого/ретроградного движения Меркурия—Плутона и расчёт пяти видов мажорных транзитно-натальных аспектов с документированными орбисами.
- Натальные градусные аспекты используются только при точных долготах; date-only/ambiguous-time не создают фиктивных аспектов.
- AI получает рассчитанные данные для символической персональной трактовки; ежедневная запись кешируется по пользователю и локальной дате.
- Добавлены PostgreSQL-схемы и миграция `0005_daily_horoscope.sql` для гороскопов, транзитного снимка и настроек уведомлений.
- Добавлены API today/history/preferences и история ежедневных записей.
- Добавлен WebApp-экран с трактовкой, транзитами, аспектами, историей и настройками времени/часового пояса.
- Главная карточка «Гороскоп дня» ведёт к новой функции.
- Добавлен opt-in Telegram notification scheduler с локальным временем, выключенными по умолчанию уведомлениями и повторной попыткой после неудачной доставки.
- Добавлены regression/API tests для транзитов, timezone, aspect gating, кеширования, истории и валидации настроек.
- CI дополнен тестовыми файлами и запускается для ветки `feat/daily-horoscope`.
- Ограничения: live AI generation и Telegram delivery не тестировались без production secrets; scheduler пока однопроцессный; независимая сверка эфемерид перед production обязательна.
- Статус итерации: реализация готовится к CI и пользовательскому ревью; не утверждена и не слита.


## 2026-11-02 — AI-астролог: утверждено пользователем

- Функциональная итерация AI-астролога утверждена пользователем после успешного CI (19 тестов, typecheck и production build).
- Draft PR №3 переведён в Ready for review; изменения не слиты в основную ветку.

## 2026-11-02 — AI-астролог: первая функциональная итерация

- Добавлен provider adapter для OpenAI Responses API; секретный ключ и модель читаются только из server environment.
- Добавлены status, chat, list/load/delete conversation endpoints.
- Добавлены server-side сценарии: отношения, потенциал, энергия недели, натальная карта.
- System instructions ограничивают астролога символической саморефлексией, запрещают выдумывать недоступные положения и не поощряют фаталистичные прогнозы.
- В контекст включаются рассчитанные знаки планет и Асцендент при наличии; сырые дата/время/место/координаты рождения из профиля не передаются модели.
- Добавлены PostgreSQL-таблицы диалогов, сообщений и дневного usage; миграция `0004_ai_astrologer.sql`.
- История диалогов сохраняется, загружается и может быть удалена пользователем.
- Реализован атомарный дневной лимит с резервированием сообщения и освобождением резерва при ошибке провайдера.
- Добавлены ограничения длины сообщения, глубины истории, output tokens и времени запроса.
- В WebApp реализован чат с восстановлением последнего диалога, историей, созданием/удалением диалогов и тематическими сценариями.
- В браузерном preview AI-запросы отключены; для чата нужна авторизованная Telegram-сессия.
- Конфигурационные значения по умолчанию Free/Premium — 5/50 сообщений в UTC-день; это временные значения и требуют отдельного утверждения.
- Добавлены unit tests с fake provider; внешние API-запросы в CI не выполняются.
- Live provider не активирован: AI_API_KEY и AI_MODEL не предоставлены серверному окружению.


## 2026-11-02 — Натальная карта: утверждено пользователем

- Функциональная итерация натальной карты утверждена пользователем после успешного CI.
- Draft PR №2 переведён в Ready for review; слияние в основную ветку не выполнялось.

## 2026-11-02 — Натальная карта: расчётное ядро и подключение UI

- Добавлен расчёт тропических геоцентрических положений Солнца, Луны, Меркурия, Венеры, Марса, Юпитера, Сатурна, Урана, Нептуна и Плутона через Astronomy Engine.
- Реализовано преобразование местного времени в UTC по IANA timezone, включая DST gaps и повторяющиеся часы.
- При неизвестном времени рассчитывается временной интервал без подстановки вымышленного полудня; знаки показываются только если они стабильны во всём интервале.
- Асцендент и дома не рассчитываются без точного момента рождения и координат.
- Добавлен расчёт Асцендента по пересечению эклиптики с восточным горизонтом и система домов Whole Sign.
- Добавлены поля широты/долготы к профилю рождения и миграция `0003_natal_charts.sql`.
- В Профиле добавлено редактирование даты, времени, часового пояса, города и координат рождения для уже зарегистрированных пользователей.
- Добавлено сохранение карты в PostgreSQL с кешированием по fingerprint исходных данных и версии алгоритма.
- Добавлен API `POST /api/astrology/natal-chart`.
- Экран Натальной карты подключён к API: реальный зодиакальный круг, положения 10 объектов, точность/неопределённость, ASC и дома при достаточных данных.
- Добавлены тесты часовых поясов, DST, солнечного знака, date-only режима и условий расчёта Асцендента.
- Ограничение: автоматическое геокодирование города не подключено; координаты можно указать вручную. Выбор провайдера геокодирования требует отдельного решения.
- Ограничение: для домов пока используется Whole Sign; изменение системы домов потребует отдельного согласования и контрольной валидации.

## 2026-11-02 — Функциональная итерация Таро

- Добавлен каталог классической колоды из 78 карт: 22 Старших и 56 Младших Арканов.
- Добавлен серверный механизм случайной выборки на `crypto.randomInt`, без повторяющихся карт в пределах одного расклада.
- Реализованы три согласованных расклада: карта дня; прошлое—настоящее—будущее; любовь и отношения.
- Добавлены API для каталога раскладов, создания, просмотра и списка истории раскладов.
- Добавлено сохранение раскладов в PostgreSQL и in-memory preview adapter для разработки.
- Для карты дня введено правило одного сохранённого результата на пользователя за UTC-день; повторное открытие возвращает существующую карту.
- Результат открывается по одной карте с CSS 3D flip; трактовки и вопросы для саморефлексии встроены в каталог.
- Журнал подключён к реальной истории Таро; будущие типы записей показывают пустые состояния вместо фиктивных материалов.
- Добавлены unit tests для каталога, числа карт, уникальности выборки и текстов раскладов.
- GitHub Actions после функциональной итерации: npm install, typecheck, unit tests и production build — успешно.
- Ограничения: трактовки статические, AI не используется; ориентация карт пока только прямая; день карты пока считается по UTC.

## 2026-11-02 — Этап 5: утверждённые UI-разделы WebApp

- Реализованы отдельные компоненты экранов: Главная, выбор расклада Таро, результат, Натальная карта, AI-астролог, Журнал, Профиль и Premium.
- Добавлена единая нижняя навигация и переходы между экранами.
- Главная приведена к утверждённой композиции: приветствие, ежедневная карта с 3D flip, гороскоп дня, три быстрых действия и серия дней.
- Добавлены табы «Карта / Положения» для натальной карты и фильтры журнала.
- Тарифы не содержат выдуманных цен; оформление Premium отключено до интеграции Telegram Stars.
- Все экраны используют общие токены палитры: ночной фон, молочный текст, приглушённое золото; фиолетовый остаётся вторичным фоновым оттенком.
- GitHub Actions: typecheck, Telegram initData tests и production build — успешно.

## 2026-11-02 — Этап 5: Telegram Bot и WebApp foundation

- Создана feature-ветка `feat/telegram-webapp-foundation` от утверждённой основы `setup/project-foundation`.
- Добавлен Telegram Bot на grammY: /start, /app, /help, inline WebApp launch button и кнопка меню Mini App при наличии HTTPS URL.
- Добавлена проверка Telegram Mini App initData на backend (HMAC-SHA-256, auth_date freshness).
- Добавлены подписанные серверные сессии и API профиля.
- Добавлено сохранение onboarding-профиля через PostgreSQL/Drizzle; в development без DATABASE_URL используется только временное in-memory хранилище.
- Добавлена SQL-миграция пользователей и данных рождения.
- Добавлен WebApp onboarding с необязательными временем, местом рождения и IANA timezone.
- Добавлены unit tests для Telegram initData validation.
- Добавлен GitHub Actions workflow: typecheck, Telegram auth tests, production build.
- Telegram Bot не запущен против реального аккаунта: токен не предоставлен через безопасные переменные окружения.
- Реальное тестирование Telegram Mini App требует публичного HTTPS deployment и настройки переменных окружения.


