# Personal Cosmic Journal

Telegram Bot + Telegram WebApp: персональный астрологический журнал с Таро, натальной картой, ежедневным гороскопом и AI-астрологом.

## Состояние проекта

Этапы 0–4 утверждены. Ветка `feat/telegram-webapp-foundation` содержит Telegram Bot, серверную Mini App authorization, onboarding API и восемь UI-разделов WebApp. Функциональная итерация Таро реализует 78-карточную колоду, три расклада, серверную случайную выборку и сохранение истории. Ветка `feat/natal-chart-engine` содержит утверждённый пользователем расчёт натальной карты. Ветка `feat/ai-astrologer` содержит первую реализацию AI-чата и ожидает проверки; внешнему AI-провайдеру ещё нужны серверные настройки.

## Стек

- WebApp: React, TypeScript, Vite
- API и Bot: Node.js, TypeScript, Fastify, grammY
- Database: PostgreSQL, Drizzle ORM, Postgres.js
- Astronomy: Astronomy Engine
- AI: provider adapter; первая интеграция — OpenAI Responses API
- Payments: Telegram Stars для цифровых товаров и услуг внутри Telegram

## Локальный запуск

1. Установить Node.js версии из `.nvmrc`.
2. Выполнить `npm install` в корне.
3. Скопировать корневой `.env.example` в `.env`, а `apps/web/.env.example` — в `.env.local` внутри `apps/web`.
4. Заполнить `TELEGRAM_BOT_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `TELEGRAM_WEBAPP_URL`, `WEBAPP_ORIGIN` и `VITE_API_URL`.
5. Применить миграции в указанном порядке:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0001_core.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0002_tarot_readings.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0003_natal_charts.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0004_ai_astrologer.sql
```

6. API + Bot: `npm run dev:server`.
7. WebApp: `npm run dev:web`.

Без `TELEGRAM_BOT_TOKEN` сервер запускается в API preview без polling. Для Mini App нужен публичный HTTPS URL. При отсутствии `DATABASE_URL` в development используется временное in-memory хранилище; это не подходит для production.

## Tarot API

- `GET /api/tarot/spreads` — список раскладов.
- `POST /api/tarot/readings` — создать расклад.
- `GET /api/tarot/readings` — история раскладов.
- `GET /api/tarot/readings/:id` — получить свой расклад.

Карта дня хранится один раз на пользователя за UTC-день.

## Натальная карта

- `POST /api/astrology/natal-chart` — рассчитать и сохранить карту.
- Поддерживаются тропические геоцентрические положения Солнца и планет до Плутона.
- Без точного времени и timezone неизвестные положения не подменяются догадками.
- Асцендент и Whole Sign houses доступны при точном времени, IANA timezone и координатах рождения.

## AI-астролог

- `GET /api/ai/status` — статус провайдера, дневной лимит и сценарии.
- `POST /api/ai/chat` — отправить вопрос, продолжить диалог или выбрать сценарий.
- `GET /api/ai/conversations` — список диалогов.
- `GET /api/ai/conversations/:id` — открыть свой диалог.
- `DELETE /api/ai/conversations/:id` — удалить диалог вместе с его сообщениями.

Для активации OpenAI на сервере задаются `AI_PROVIDER=openai`, `AI_API_KEY` и `AI_MODEL`. Модель не закреплена в коде: её нужно выбрать и указать в окружении. API-ключ никогда не передаётся в WebApp. Запрос Responses API использует `store: false`; приложение отдельно сохраняет диалоги в собственной PostgreSQL, чтобы их можно было продолжать и удалять.

Дневные лимиты по умолчанию: Free — 5, Premium — 50 сообщений в UTC-день. Это временные конфигурационные значения, а не утверждённые тарифы. Их можно изменить через `AI_FREE_DAILY_LIMIT` и `AI_PREMIUM_DAILY_LIMIT`. Premium entitlements и оплата ещё не подключены.

AI получает текст диалога и сокращённые рассчитанные положения планет. Дата рождения, место рождения и координаты из профиля в контекст модели не передаются. Пользователь может сам включить личную информацию в текст сообщения. До production необходимо согласовать политику конфиденциальности и условия выбранного AI-провайдера. Без серверных ключа и модели чат показывает, что провайдер не подключён.

## Защита расходов

- `AI_MAX_INPUT_CHARS` — максимальная длина пользовательского сообщения.
- `AI_MAX_HISTORY_MESSAGES` — глубина истории, передаваемой модели.
- `AI_MAX_OUTPUT_TOKENS` — ограничение размера ответа.
- `AI_REQUEST_TIMEOUT_MS` — тайм-аут обращения.
- Дневная квота резервируется атомарно; при ошибке провайдера резерв освобождается.
- Сценарии и system instructions контролируются сервером.

## Проверки

```bash
npm run typecheck
npm run test:server
npm run build
```

GitHub Actions выполняет typecheck, unit tests и production build.

## Документация

- [PRD](docs/PRD.md)
- [Технические решения](docs/DECISIONS.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [Расчёты астрологии](docs/ASTROLOGY-CALCULATIONS.md)
- [AI-астролог](docs/AI-ASTROLOGER.md)
- [UI Guidelines](docs/UI-GUIDELINES.md)
- [Референсы](docs/REFERENCE-ASSETS.md)
- [Changelog](docs/CHANGELOG.md)
- [Статус проекта](docs/PROJECT-STATUS.md)

## Безопасность

Не коммитить `.env`, Telegram Bot Token, AI API keys, персональные данные и платёжные секреты. Секреты передаются серверу через переменные окружения. Сервер проверяет Telegram `initData` до создания session token; `initDataUnsafe` не используется для авторизации.
