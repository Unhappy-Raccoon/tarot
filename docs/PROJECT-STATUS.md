# Project status

## Основные возможности

| Workstream | Status |
|---|---|
| Этапы 0–4 — discovery, PRD, UX/UI, architecture, repository foundation | Approved |
| Telegram bot, auth and onboarding foundation | Implemented |
| WebApp screens | Implemented |
| Tarot catalogue and reading engine | 78 cards; Daily, Past–Present–Future, Love & Relationships |
| Tarot draw and journal persistence | Server-side cryptographic draw; PostgreSQL persistence |
| Natal charts | Implemented; Whole Sign houses when birth time and coordinates are exact |
| AI astrologer API and UI | Implemented; provider configuration passes readiness |
| AI conversation history and deletion | Implemented |
| Daily transits and personal horoscope | Implemented with local-date persistence |
| Telegram horoscope notifications | Supabase Cron worker deployed; job and HTTP callback verified; real user delivery remains untested |
| Telegram Stars / paid plans | Disabled; not implemented |
| Production deployment | Not configured |

## Supabase test environment — status as of 2026-11-03

Target project: `uayoqicecdtcxouwsprh` (North EU). This is a controlled test environment, not production.

| Area | Verified result |
|---|---|
| PostgreSQL migrations | Seven migrations applied; latest CLI dry run reports no pending migrations |
| Schema | All 9 expected application tables found |
| RLS | Enabled on all 9 application tables; 0 public policies |
| Database connection | Session Pooler works from Supabase Edge Runtime |
| Edge Functions | `api`, `telegram-webhook`, `process-horoscope-notifications` deployed |
| API liveness | `GET /health` → HTTP 200 |
| Tarot catalogue | `GET /api/tarot/spreads` → HTTP 200 |
| Runtime readiness | `GET /health/ready` → HTTP 200; database, Telegram configuration, session, WebApp and AI configuration checks pass |
| Auth and CORS guards | Unauthorized requests rejected; expected WebApp origin allowed; unexpected origin rejected |
| Supabase Cron | `pg_cron`, `pg_net` and Vault present; notification job scheduled |
| Cron worker | Last observed run succeeded; Edge Function callback returned HTTP 200 and `sent=0, skipped=0, failed=0` (no due recipients) |
| WebApp artifact | GitHub Pages production build and artifact upload pass |
| GitHub Pages deployment | **Blocked:** build/artifact succeeds; deploy job is rejected before runner allocation (`runner_id=0`, no steps, no pending approvals). Check `github-pages` environment deployment-branch policy for `feat/supabase-edge-runtime`; workflow also logs Pages API source/build_type once the gate permits a runner |
| Telegram webhook | Function and protected setup endpoint deployed; actual `getMe` / `setWebhook` / Mini App menu setup is pending successful Pages publication |
| OpenAI | Runtime configuration is present; a real Responses API generation has not yet been performed |
| End-to-end user flow | Pending: Telegram `/start`, Mini App authentication, Tarot, natal chart, AI chat and first opt-in notification |

Evidence:
- [Supabase function deployment, Cron and Vault setup — run #41669561604](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41669561604)
- [Full database, RLS, auth/CORS and runtime smoke test — run #41669991337](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41669991337)
- [Latest CI — run #41671460540](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41671460540)
- [Latest Pages publication attempt — run #41671460988](https://github.com/Unhappy-Raccoon/tarot/actions/runs/41671460988)

The database secret is assembled in GitHub Actions from the protected `SUPABASE_DB_PASSWORD` secret and sent to Supabase CLI as `DATABASE_URL`. The password is URL-encoded, is not written to repository files, and is not printed in workflow logs.

## What must happen before the test launch is complete

1. In GitHub repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. The Pages API currently returns 404 until this repository setting is enabled.
2. After enabling Pages, re-create the one-time `.github/deploy-requests/publish-pages.txt` marker with `PUBLISH_TO_TEST` and push a commit gated by `[publish-pages]`. The previous marker was removed after the blocked 404 attempt. On successful publication, the workflow checks the public page and calls the protected Supabase Telegram setup endpoint. That endpoint calls Telegram `getMe`, configures the webhook, bot commands and Mini App menu, then verifies `getWebhookInfo`.
3. Verify the bot from Telegram with `/start` and open the Mini App. This is the first end-to-end Telegram identity and WebApp authentication test.
4. Submit one small AI chat request from the WebApp. Readiness currently proves that AI secrets/model configuration exist; it does not prove that the selected model accepts a live Responses API request.
5. Only after the user flow passes, treat the test deployment as launched. Notification preferences remain opt-in and payments remain disabled.

Do not invite external testers until the privacy notice / terms and data-retention expectations are reviewed. The application stores birth profile details and conversation content in PostgreSQL; AI requests send conversation text and summarized calculated planetary positions to the configured provider. A live provider test and an end-to-end Telegram user test are still pending.

## Technical constraints

- The deployed database connection uses the Supabase Session Pooler with `DATABASE_POOL_MAX=1`. This is a low-load test arrangement for the current `postgres.js` / Drizzle transaction usage, not a high-concurrency production topology. Before inviting many testers, evaluate a driver compatible with Supabase shared Transaction Pooler and repeat transaction tests.
- Supabase Edge Functions read runtime secrets directly from `Deno.env`; application code does not mutate `process.env`.
- The API Edge Function reuses Fastify routes through in-memory `app.inject()` without starting a listener.
- Telegram webhook requests are validated with Telegram's secret-token header. Horoscope Cron requests use a separate secret stored in Supabase Vault.
- Horoscope notification preferences default to off. The worker uses atomic per-user/local-date claims. A Telegram network outcome can still be ambiguous if the send response is lost; the worker retains the claim lease to avoid immediate duplicate messages.
- No automatic geocoding is enabled; birth coordinates can be entered manually.
- A natal chart without a precise birth time does not invent an Ascendant, houses or exact degrees.
- Daily transits use a 12:00 local snapshot. Transit-to-natal aspects are shown only when exact natal longitudes are available.
- Transit calculations have regression tests but still require comparison against an independent ephemeris reference before production.
- Exact Free/Premium entitlements and commercial limits are not approved. Monetization and Telegram Stars are off.
- The test environment is not production. No production deployment, custom domain or VPS is configured.

## Branch and review status

- Active branch: `feat/supabase-edge-runtime`.
- PR #7 remains open against `feat/supabase-test-environment`; PRs #1–#6 are also open in the stacked review chain.
- No PR has been merged to `main`. The test Pages workflow is intentionally guarded to the approved test project and feature branch.
