# Project status

| Workstream | Status |
|---|---|
| Этап 0 — Discovery / MVP scope | Approved |
| Этап 1 — PRD / flows | Approved |
| Этап 2 — UX/UI references | Approved |
| Этап 3 — technical architecture | Approved |
| Этап 4 — repository foundation | Approved |
| Этап 5 — Telegram Bot + WebApp foundation | Implemented in `feat/telegram-webapp-foundation`, pending review |
| Bot commands and WebApp launch | Implemented; requires bot token + public HTTPS URL for live test |
| Telegram initData verification | Implemented with automated unit tests |
| Onboarding API | Implemented; requires database in production |
| WebApp onboarding and home shell | Implemented; preview mode available outside Telegram |
| Tarot engine / natal calculations / AI | Not implemented |
| Journal persistence | Not implemented |
| Telegram Stars payments | Not implemented |
| Production deployment | Not configured |

## Current constraints

- Set `TELEGRAM_BOT_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `TELEGRAM_WEBAPP_URL`, `WEBAPP_ORIGIN`, and `VITE_API_URL` outside Git.
- Apply SQL migration `apps/server/migrations/0001_core.sql` before using persistent onboarding in production.
- For WebApp buttons Telegram requires a public HTTPS URL.
- Development without DATABASE_URL uses in-memory user profiles; data is lost when the server restarts.
- Exact Free/Premium limits and prices are not approved.
- AI provider/model is not selected.
- Bot behavior from `@my_first_tarot_test_bot` still needs a user-provided walkthrough for parity.
