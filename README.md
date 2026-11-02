# Personal Cosmic Journal

Telegram Bot + Telegram WebApp: персональный астрологический журнал с Таро, натальной картой, ежедневным гороскопом и AI-астрологом.

## Состояние проекта

Этапы 0–4 утверждены. Ветка `feat/telegram-webapp-foundation` содержит Telegram Bot, серверную Telegram Mini App authorization, onboarding API и восемь связанных UI-разделов WebApp. Функциональная итерация Таро реализует 78-карточную колоду, три расклада, серверную случайную выборку и сохранение истории. Натальные расчёты, AI-астролог, ежедневный гороскоп, платежи и production deployment ещё не подключены.

## Стек

- WebApp: React, TypeScript, Vite
- API и Bot: Node.js, TypeScript, Fastify, grammY
- Shared: общие типы и контракты
- Database: PostgreSQL, Drizzle ORM, Postgres.js
- Astronomy: Astronomy Engine; Асцендент рассчитывается отдельным проверяемым модулем
- AI: подключаемый LLM-провайдер через adapter
- Payments: Telegram Stars для цифровых товаров и услуг внутри Telegram

## Структура

```text
apps/
  web/       Telegram WebApp и экраны продукта
  server/    Fastify API и grammY Bot
packages/
  shared/    Общие типы и схемы
assets/
  references/ Утверждённые визуальные референсы
  tarot/      Материалы колод Таро
  astrology/  Астрологические иллюстрации
docs/        PRD, решения, архитектура и дизайн-система
```

## Локальный запуск

1. Установить Node.js версии из `.nvmrc`.
2. Выполнить `npm install` в корне.
3. Скопировать корневой `.env.example` в `.env`; для Vite скопировать `apps/web/.env.example` в `apps/web/.env.local`.
4. Заполнить `TELEGRAM_BOT_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `TELEGRAM_WEBAPP_URL`, `WEBAPP_ORIGIN` и `VITE_API_URL` подходящими локальными/публичными значениями.
5. Применить SQL-миграции по порядку:
   `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0001_core.sql`
   `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0002_tarot_readings.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0003_natal_charts.sql`
6. API + Bot: `npm run dev:server`.
7. WebApp: `npm run dev:web`.

Без `TELEGRAM_BOT_TOKEN` сервер запускается в режиме API preview; Telegram polling не стартует. Для реальных Mini App кнопок нужен публичный HTTPS URL. При локальной разработке вне Telegram WebApp доступен preview onboarding и демонстрационный Tarot preview с локальным хранением браузера. При отсутствии `DATABASE_URL` сервер в development использует временное in-memory хранилище; это не подходит для production.

## Tarot API

- `GET /api/tarot/spreads` — список доступных раскладов.
- `POST /api/tarot/readings` — создать расклад (`spreadId: daily | past-present-future | love`).
- `GET /api/tarot/readings` — список сохранённых раскладов текущего пользователя.
- `GET /api/tarot/readings/:id` — получить собственный расклад.

Карта дня сохраняется один раз на пользователя за UTC-день. Повторный запрос в этот день возвращает уже сохранённую карту. Остальные расклады пока не ограничены тарифными лимитами, потому что числовые Free/Premium лимиты ещё не утверждены.

## Проверки

- `npm run typecheck`
- `npm run test:server`
- `npm run build`

GitHub Actions выполняет эти проверки для feature-ветки.

## Документация

- [PRD](docs/PRD.md)
- [Технические решения](docs/DECISIONS.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [UI Guidelines](docs/UI-GUIDELINES.md)
- [Референсы](docs/REFERENCE-ASSETS.md)
- [Changelog](docs/CHANGELOG.md)
- [Статус проекта](docs/PROJECT-STATUS.md)

## Безопасность

Не коммитить `.env`, Telegram Bot Token, AI API keys, приватные данные пользователей и платёжные секреты. Секреты передаются серверу через переменные окружения. Сервер проверяет Telegram `initData` до создания session token; `initDataUnsafe` не используется для авторизации.
