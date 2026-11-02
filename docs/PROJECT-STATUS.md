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
| Natal planetary calculations | Implemented and user-approved; PR #2 ready for review |
| Ascendant / Whole Sign houses | Implemented and user-approved, conditional on exact time, IANA timezone and coordinates |
| Birth profile editor | Implemented and user-approved for date, time, timezone, place and manual coordinates |
| AI astrologer API + UI | Implemented in `feat/ai-astrologer`, pending review |
| AI conversation history / deletion | Implemented with PostgreSQL + development in-memory adapter |
| AI provider live connection | Not activated; server key and model configuration required |
| Real horoscope / transits | Not implemented |
| Telegram Stars payments | Not implemented |
| Production deployment | Not configured |

## Current constraints

- Apply migrations in order: `0001_core.sql`, `0002_tarot_readings.sql`, `0003_natal_charts.sql`, then `0004_ai_astrologer.sql`.
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


## Natal chart implementation constraints

- Apply migration `0003_natal_charts.sql` after `0001_core.sql` and `0002_tarot_readings.sql`.
- Date-only charts show only zodiac signs stable across the possible time window; no exact degree or Ascendant is invented.
- Automatic city geocoding is not connected. Coordinates are optional fields in the birth profile.
- Whole Sign is the initial house-system default; additional systems require separate review and validation.


## AI astrologer iteration constraints

- OpenAI Responses API adapter is implemented, but no provider is activated until `AI_API_KEY` and `AI_MODEL` are configured on the server.
- Free default is 5 messages per UTC day and Premium default is 50; both are provisional environment-configurable values and require product approval.
- Premium entitlements and payment are not connected; the user plan is currently provisioned separately.
- Chat history is persisted in PostgreSQL and can be deleted per conversation.
- AI inputs include conversation text and summarized calculated planet signs; raw birth date, time, birthplace and coordinates from the profile are not sent in the generated context.
- AI output is not streamed in this iteration; requests use timeout, input length, history length and output token caps.
- A live provider call was not performed because no API key/model has been configured in the server environment.
