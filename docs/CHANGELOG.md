# Changelog

## 2026-11-02 — Этап 5: утверждённые UI-разделы WebApp

- Реализованы отдельные компоненты экранов: Главная, выбор расклада Таро, результат, Натальная карта, AI-астролог, Журнал, Профиль и Premium.
- Добавлена единая нижняя навигация и переходы между экранами.
- Главная приведена к утверждённой композиции: приветствие, ежедневная карта с 3D flip, гороскоп дня, три быстрых действия и серия дней.
- Добавлены табы «Карта / Положения» для натальной карты и фильтры журнала.
- Добавлены демонстрационные расклады и пример диалога; они явно помечены как демо и не создают фиктивных backend-операций.
- Тарифы не содержат выдуманных цен; оформление Premium отключено до согласования и интеграции Telegram Stars.
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
- CI: Node.js 26.13.0 install, typecheck, Telegram auth tests и сборка всех workspace завершились успешно (workflow run #2).
- Telegram Bot не запущен против реального аккаунта: токен не предоставлен через безопасные переменные окружения.
- Реальное тестирование Telegram Mini App требует публичного HTTPS deployment и настройки переменных окружения.
