# Changelog

## 2026-11-02 — Этап 5: Telegram Bot и WebApp foundation

- Создана feature-ветка `feat/telegram-webapp-foundation` от утверждённой основы `setup/project-foundation`.
- Добавлен Telegram Bot на grammY: /start, /app, /help, inline WebApp launch button и кнопка меню Mini App при наличии HTTPS URL.
- Добавлена проверка Telegram Mini App initData на backend (HMAC-SHA-256, auth_date freshness).
- Добавлены подписанные серверные сессии и API профиля.
- Добавлено сохранение onboarding-профиля через PostgreSQL/Drizzle; в development без DATABASE_URL используется только временное in-memory хранилище.
- Добавлена SQL-миграция пользователей и данных рождения.
- Добавлен WebApp onboarding с необязательными временем, местом рождения и IANA timezone.
- Добавлена начальная домашняя оболочка в утверждённой палитре, быстрые ссылки, блок гороскопа, streak placeholder и нижняя навигация.
- Добавлены unit tests для Telegram initData validation.
- Добавлен GitHub Actions workflow: typecheck, auth tests, production build.
- CI: Node.js 26.13.0 install, typecheck, Telegram auth tests и сборка всех workspace завершились успешно (workflow run #2).
- Telegram Bot не запущен против реального аккаунта: токен не предоставлен через безопасные переменные окружения.
- Полные функциональные разделы Таро, натальной карты, AI, журнала, платежей и аналитики остаются следующими реализационными задачами.
- Реальное тестирование Telegram Mini App требует публичного HTTPS deployment и настройки переменных окружения.
