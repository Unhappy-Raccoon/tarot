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
| Этап 5.3 — Tarot reading engine and journal persistence | Implemented and user-approved |
| Tarot catalog | 78 cards (22 Major + 56 Minor Arcana) |
| Tarot spreads | Daily, Past–Present–Future, Love & Relationships |
| Tarot draw | Server-side cryptographic random selection, no duplicates within a spread |
| Tarot persistence | PostgreSQL migration + development in-memory adapter |
| Natal planetary calculations | Implemented and user-approved; PR #2 ready for review |
| Ascendant / Whole Sign houses | Implemented and user-approved, conditional on exact time, IANA timezone and coordinates |
| Birth profile editor | Implemented and user-approved for date, time, timezone, place and manual coordinates |
| AI astrologer API + UI | Implemented and user-approved; PR #3 ready for review |
| AI conversation history / deletion | Implemented and user-approved |
| AI provider live connection | Adapter implemented; server key and model configuration required |
| Daily transit calculation | Implemented and user-approved; CI passing |
| Personal daily horoscope API + WebApp | Implemented and user-approved; PR #4 ready for review |
| Daily horoscope history | Implemented with PostgreSQL + development in-memory adapter |
| Telegram daily horoscope notifications | Opt-in preference and single-process scheduler implemented; user-approved; live delivery not verified |
| Telegram Stars payments | Not implemented |
| MVP stabilization / test launch | Technical preparation user-approved (2026-11-02); VPS plan superseded by Supabase target |
| Supabase test deployment adaptation | Implemented on `feat/supabase-edge-runtime`: Edge API adapter, Telegram webhook, Cron worker, atomic notification claim, Deno security tests; hosted runtime verification and credentials pending |
| WebApp hosting target | GitHub Pages selected and workflow added; manual publish is guarded to `main` after integration and explicit dispatch |
| Production deployment | Not configured; a real test deployment still requires operator secrets and domains |

## Current constraints

- Apply migrations in order: `0001_core.sql`, `0002_tarot_readings.sql`, `0003_natal_charts.sql`, `0004_ai_astrologer.sql`, then `0005_daily_horoscope.sql`.
- Development without DATABASE_URL uses in-memory data; it is lost when the server restarts. Notification scheduling requires PostgreSQL.
- Automatic geocoding is not enabled; birth coordinates may be entered manually.
- Natal chart without birth time is date-range based: no ASC, houses, or exact degrees are invented.
- Current natal house system is Whole Sign.
- Exact Free/Premium commercial limits and Premium entitlements are not approved or connected to payment.
- Telegram bot live test requires secrets and a public HTTPS Mini App URL.
- AI provider/model has not been selected/configured in the live server environment.
- Daily horoscope generates one saved entry per user and local date, using a 12:00 local transit snapshot.
- Transit-to-natal aspects require exact natal longitudes; date-only or ambiguous-time charts do not produce degree aspects.
- Transit calculations have regression tests but still require validation against an independent ephemeris reference before production.
- Telegram notification preferences default to off. The current one-process scheduler is not safe for multiple active API instances until a distributed claim/lock is added.
- Real AI generation and Telegram delivery are not verified without live server credentials and deployment.
- Behavior parity with `@my_first_tarot_test_bot` still needs a user-provided walkthrough or test account access.
- Full end-to-end checks of Tarot, natal chart, AI chat and daily horoscope are intentionally deferred until the test environment has been launched successfully.
- Technical test-launch preparation was explicitly approved by the user on 2026-11-02. No live deployment or end-to-end user scenario verification has yet been performed.
- Supabase test deployment requires a Supabase project, database password/transaction-pooler URL, Telegram Bot Token, webhook secret, session secret, Cron secret, OpenAI API key/model, and GitHub Pages Actions variable `VITE_API_URL`. No test or production secrets are stored in the repository.
- Supabase DB migrations are copied to `supabase/migrations/`; a final migration enables RLS on all application tables and a later migration adds atomic horoscope-notification claims.
- `supabase/functions/api` reuses existing Fastify routes using in-memory `app.inject()` without starting a listener; it imports compiled `apps/server/dist` after Edge secrets have been bridged into Node-compatible `process.env`.
- `supabase/functions/telegram-webhook` validates Telegram's webhook secret header and dispatches updates to grammY. One-time bot command/menu/webhook setup is in `scripts/configure-supabase-telegram.mjs`.
- `supabase/functions/process-horoscope-notifications` is the Cron worker. It processes a bounded batch and uses atomic database claim fields to prevent concurrent Cron invocations from sending the same local-date notification twice. Unknown Telegram send outcomes retain the claim until lease expiry; exact-once delivery to an external Telegram API cannot be guaranteed if a network response is lost.
- User approved GitHub Pages as the static WebApp host alongside Supabase as the only server-side platform on 2026-11-02. Workflow `.github/workflows/pages.yml` builds artifacts on feature pushes and only publishes after a manual `workflow_dispatch` from `main` with explicit `publish=yes`. Vite base path is configurable via `VITE_BASE_PATH`; deploy build uses `/tarot/`.
- A custom domain and VPS are not required for the initial Supabase test environment; Supabase provides the API project URL and GitHub Pages provides the project's `github.io` URL.
- The Supabase Edge Functions compile from the built Node workspace; `npm run check:supabase` and `npm run test:supabase` are also wired into CI using Deno. Hosted Supabase deployment and integration smoke tests have not yet been performed.

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

## Daily horoscope iteration constraints

- Functional iteration approved by the user on 2026-11-02; PR #4 marked Ready for review and remains unmerged.


- New migration: `0005_daily_horoscope.sql`.
- Transit snapshot: 10 tropical geocentric bodies at 12:00 local time, with a ±24-hour finite-difference motion flag for Mercury–Pluto.
- Supported major aspects and orb limits are documented in `docs/ASTROLOGY-CALCULATIONS.md`; only precise natal longitudes are used.
- Daily reading is cached per user/local calendar date; history is stored independently of the AI conversation history.
- Notification timezone and local delivery time are editable in WebApp; notifications are opt-in and disabled by default.
- Notification scheduler currently runs inside the Telegram Bot/API process, polls every 60 seconds and assumes a single active instance.
- Live generation and delivery have not been tested because the server AI model/key and Telegram production environment are not configured.
