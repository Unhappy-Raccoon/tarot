# Personal Cosmic Journal

Telegram Bot + Telegram WebApp: персональный астрологический журнал с Таро, натальной картой, ежедневным гороскопом и AI-астрологом.

## Состояние

На ветке `setup/project-foundation` находится каркас проекта и согласованная документация. Функциональные модули MVP ещё не реализованы.

## Стек

- WebApp: React, TypeScript, Vite
- API и Bot: Node.js, TypeScript, Fastify, grammY
- Shared: общие типы и контракты
- Database: PostgreSQL, Drizzle ORM, Postgres.js
- Astronomy: Astronomy Engine; Асцендент рассчитывается изолированным модулем
- AI: подключаемый LLM-провайдер через adapter
- Payments: Telegram Stars для цифровых товаров и услуг внутри Telegram

## Структура

```text
apps/
  web/       Telegram WebApp
  server/    Fastify API и grammY Bot
packages/
  shared/    Общие типы и схемы
assets/
  references/ Папка для утверждённых визуальных референсов
  tarot/      Материалы колод Таро
  astrology/  Астрологические иллюстрации
docs/        PRD, решения, архитектура и дизайн-система
```

## Локальный запуск

1. Установить Node.js версии из `.nvmrc`.
2. Выполнить `npm install` в корне.
3. Скопировать `.env.example` в `.env` и заполнить локальные значения.
4. WebApp: `npm run dev:web`.
5. API: `npm run dev:server`.

На этапе каркаса API предоставляет только `GET /health`. Telegram Bot, база данных, авторизация, платежи и пользовательские сценарии добавляются отдельными этапами.

## Документация

- [PRD](docs/PRD.md)
- [Технические решения](docs/DECISIONS.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [UI Guidelines](docs/UI-GUIDELINES.md)
- [Референсы](docs/REFERENCE-ASSETS.md)
- [Changelog](docs/CHANGELOG.md)
- [Статус проекта](docs/PROJECT-STATUS.md)

## Безопасность

Не коммитить `.env`, Telegram Bot Token, AI API keys, приватные данные пользователей и платёжные секреты. Секреты передаются серверу через переменные окружения.
