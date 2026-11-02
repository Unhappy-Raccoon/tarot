# Project status

| Workstream | Status |
|---|---|
| Этап 0 — Discovery / MVP scope | Approved |
| Этап 1 — PRD / flows | Approved |
| Этап 2 — UX/UI references | Approved |
| Этап 3 — technical architecture | Approved |
| Этап 4 — repository foundation | Approved |
| Этап 5.1 — Bot, auth, onboarding foundation | Implemented and approved |
| Этап 5.2 — WebApp screen implementation | Implemented and approved |
| Этап 5.3 — Tarot reading engine and journal persistence | Implemented in feature branch, pending review |
| Tarot catalog | 78 cards (22 Major + 56 Minor Arcana) |
| Tarot spreads | Daily, Past–Present–Future, Love & Relationships |
| Tarot draw | Server-side cryptographic random selection, no duplicates within a spread |
| Tarot persistence | PostgreSQL migration + development in-memory adapter |
| Daily card | One stored daily reading per user per UTC date |
| Journal | Connected to actual Tarot reading history |
| CI (typecheck, tests, workspace build) | Passing on Tarot iteration |
| Natal calculations / real horoscope / AI | Not implemented |
| Telegram Stars payments | Not implemented |
| Production deployment | Not configured |

## Current constraints

- Apply migrations in order: `0001_core.sql`, then `0002_tarot_readings.sql`.
- Development without DATABASE_URL uses in-memory user profiles and readings; data is lost when server restarts.
- Daily Tarot date boundary currently uses UTC; user-local timezone scheduling is a separate follow-up.
- Tarot interpretations are static editorial texts, not AI-generated.
- Automatic geocoding is not enabled; birth coordinates may be entered manually.
- Natal chart without birth time is date-range based: no ASC, houses, or exact degrees are invented.
- Current natal house system is Whole Sign and requires separate review before changing.
- Reversed-card orientation and per-plan spread limits are not implemented; exact Free/Premium limits are not approved.
- Telegram bot live test requires secrets and a public HTTPS Mini App URL.
- AI provider/model and Premium prices are not selected.
- Behavior parity with `@my_first_tarot_test_bot` still needs a user-provided walkthrough or test account access.
