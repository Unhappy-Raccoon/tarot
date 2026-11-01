# Personal Cosmic Journal

Telegram Bot + Telegram WebApp: персональный астрологический журнал с Таро, натальной картой, ежедневным гороскопом и AI-астрологом.

## Состояние проекта

Этапы 0–4 утверждены. Ветка `feat/telegram-webapp-foundation` содержит первую реализацию Этапа 5: Telegram Bot commands, серверную Telegram Mini App authorization, onboarding API и восемь связанных UI-разделов WebApp. Данные для карт, астрологии, чата и журнала пока демонстрационные; AI, платежи и полноценная backend-логика функций ещё не подключены.

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
5. Применить SQL миграцию: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f apps/server/migrations/0001_core.sql`.
6. API + Bot: `npm run dev:server`.
7. WebApp: `npm run dev:web`.

Без `TELEGRAM_BOT_TOKEN` сервер запускается в режиме API preview; Telegram polling не стартует. Для реальных Mini App кнопок нужен публичный HTTPS URL. При локальной разработке вне Telegram WebApp доступен preview onboarding с локальным хранилищем браузера. При отсутствии `DATABASE_URL` сервер в development использует временное in-memory хранилище; это не подходит для production.

## Проверки

- `npm run typecheck`
- `npm run test:server`
- `npm run build`

GitHub Actions выполняет эти проверки для feature-ветки. Последняя проверка после добавления UI-экранов прошла успешно.

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
