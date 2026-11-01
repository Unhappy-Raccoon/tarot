# Project status

| Workstream | Status |
|---|---|
| Этап 0 — Discovery / MVP scope | Approved |
| Этап 1 — PRD / flows | Approved |
| Этап 2 — UX/UI references | Approved |
| Этап 3 — technical architecture | Approved |
| Этап 4 — repository foundation | Approved |
| Этап 5.1 — Bot, auth, onboarding foundation | Implemented and approved |
| Этап 5.2 — WebApp screen implementation | Implemented in `feat/telegram-webapp-foundation`, pending review |
| Bot commands and WebApp launch | Implemented; live test requires bot token + public HTTPS URL |
| Telegram initData verification | Implemented; unit tests passing |
| Onboarding API | Implemented; persistent mode requires PostgreSQL migration |
| WebApp onboarding | Implemented; local preview mode available |
| Main screen and 7 product sections | Implemented as UI with explicitly marked demo data |
| CI (typecheck, Telegram auth tests, workspace build) | Passing on latest UI implementation commit |
| Tarot engine / natal calculations / AI | Not implemented |
| Journal backend persistence | Not implemented |
| Telegram Stars payments | Not implemented |
| Production deployment | Not configured |

## Current constraints

- Set `TELEGRAM_BOT_TOKEN`, `SESSION_SECRET`, `DATABASE_URL`, `TELEGRAM_WEBAPP_URL`, `WEBAPP_ORIGIN`, and `VITE_API_URL` outside Git.
- Apply SQL migration `apps/server/migrations/0001_core.sql` before using persistent onboarding in production.
- Telegram Mini App launch buttons require a public HTTPS URL.
- Development without DATABASE_URL uses in-memory user profiles; data is lost when the server restarts.
- Tarot cards and interpretations, natal placements, AI conversation and journal entries are demo UI data and are not yet backend-connected.
- Exact Free/Premium limits and prices are not approved.
- AI provider/model is not selected.
- Behavior parity with `@my_first_tarot_test_bot` still needs a user-provided walkthrough or test account access.
