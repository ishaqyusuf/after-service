# MVP Verification

Updated: 2026-10-19

## Latest Results

Verified locally on 2026-10-18:

- 40/40 browser cases passed with retries disabled: 10 journeys each in
  Chromium, Firefox, WebKit, and a Pixel 7 Chromium viewport.
- 35/35 real PostgreSQL integration tests passed (121 assertions), including
  production email preconditions and queue rejections without state writes,
  plus sent-state ordering after a stubbed queue acceptance.
- 60/60 unit tests passed (132 assertions), including scheduled-route auth,
  no-store responses, server-clock invocation, and rejected query overrides.
- Full monorepo typecheck and test-harness typecheck passed.
- Dashboard and website optimized production builds passed with internal QA,
  analytics, and Sentry upload credentials disabled, using the local DB profile.
  The website required a fresh Turbopack cache after a sandbox port-binding
  failure; the successful rebuild used the normal approval mechanism.
- The standalone API bundled successfully with Bun into a temporary file.
- Scoped Biome checks passed for all 32 touched code/config files;
  repository-wide lint remains blocked by existing shared UI findings
  (95 errors and 29 warnings).
- Post-run database audit found zero generated browser accounts and zero
  integration fixture workspaces. Test-started web servers were stopped.

Production builds do not deploy these changes. This coverage is for the
manual MVP journeys listed below, not every provider/device combination.

## Commands

```sh
bun run test:unit
bun run test:integration
bunx playwright install chromium firefox webkit
bun run test:e2e
bun run test:typecheck
bun run typecheck
```

Integration tests require the shared local-infra profile and its running local
PostgreSQL service (`bun run dev:services`). Browser tests start the website and
dashboard through `bun run dev --local --filter dashboard website`, or reuse a
running stack outside CI. They do not start the jobs worker.

The default browser hosts are `https://afterservice.localhost` and
`https://app-afterservice.localhost`. An HTTP Portless setup can override
`E2E_WEBSITE_URL` and `E2E_DASHBOARD_URL`, for example with port `1355`.
Production and lookalike hostnames are rejected. Database fixtures require
`AFTERSERVICE_ENV_MODE=local` and a loopback PostgreSQL URL.
Both Next.js apps allow their exact Portless hostname for development assets
and diagnostic endpoints. There is no wildcard dev-origin exception.

## Browser Coverage

`playwright.config.ts` runs the same journeys in desktop Chromium, Firefox,
WebKit, and a Pixel 7 Chromium viewport. `tests/e2e/*.pw.ts` deliberately uses a
suffix that Bun's unit test discovery does not collect.

- Signup validation, reserved onboarding names, workspace setup, persisted
  sessions, sign-in return paths, and real sign-out.
- Invalid credentials, forged/stale cookies, authenticated auth-page redirects,
  and unsafe external/backslash return paths.
- Customer empty state, validation, creation, submitted search, no results,
  edit, archive, and persisted removal from the active list.
- Job creation with an existing customer and a value, then scheduling a phone
  follow-up from the job.
- Direct follow-up creation with an inline customer, calendar rescheduling,
  manual phone contact logging, reply, closure, board and history updates.
- Starter templates, archive, create, edit, saved channel/default state, and
  submitted template search.
- Workspace settings persistence, Free Beta billing, disabled paid checkout,
  and resilience to an injected optional-portal permission denial. Core
  mutations/plan reads still use the real API/database.
- Homepage, pricing, features, customers, privacy, terms, and website auth redirects.
- Uncaught application errors fail tests. One exact WebKit developer-overlay
  failure is recorded as a `next-devtools` annotation instead: an access-control
  error for `__nextjs_original-stack-frames` whose stack comes from
  `next-devtools`. IndexedDB, hydration, and other application errors remain
  failures. Failure screenshots and traces are retained
  under `test-results/`; `playwright-report/` contains the local HTML report.

Each mutating test owns a randomly named `browser-<uuid>@afterservice.invalid`
identity. Teardown uses Bun/Prisma to remove only that exact user's single-owner
workspace and identity. Prisma stays on the application's Bun runtime while
Playwright uses its Node.js runner. No broad prefix-based database purge runs.

## API Integration Coverage

`tests/integration/mvp.integration.ts` uses the real local PostgreSQL database,
tRPC callers, Better Auth session resolution, and Hono requests. It covers:

- Workspace-isolated reads, lists, mutations, and follow-up state changes.
- Job/customer consistency, template ownership, and member assignment checks.
- Anonymous, not-onboarded, staff, and platform-admin permission boundaries.
- Session expiry and membership removal through the real API context.
- Missed-state processing is workspace-scoped on the manual endpoint,
  repeat-safe, excludes exact/future due times and contacted/closed statuses,
  and creates no message logs.
- Invalid inputs, customer/template/follow-up limits, archive capacity recovery,
  workspace cadence, default templates, and follow-up audit/message records.
- Email configuration and queue rejection leave sent state, logs, and events
  unchanged; a stubbed accepted queue response precedes sent-state writes.
- Free Beta checkout, webhook signatures, duplicate events, plan activation and
  cancellation, malformed webhook/cron JSON, cron credentials, and dry-run safety.

Generated integration records are removed by exact IDs after each test. These
tests do not enable checkout or dispatch email, SMS, or WhatsApp. Manual phone
logging uses an atomic database write and does not call a provider.

## Boundaries And Remaining Checks

- This suite covers the manual MVP. It does not prove live provider delivery,
  Google OAuth interaction, production scheduler setup, native PWA installation,
  or production payment-provider configuration.
- The pre-existing `smoke:mvp` queued-email path still requires a separately
  running Trigger.dev worker. Starting that worker was rejected by automatic
  approval review during this task because it may consume existing jobs and
  send email; that path was not rerun.
- Repository-wide lint has existing shared UI errors. Check touched files
  independently and report the broader lint result separately.

## Logly Dependency Patch

`patches/@ishaqyusuf%2Flogly-core@0.2.0.patch` is applied by Bun's
`patchedDependencies` contract. It changes IndexedDB cleanup from
`openKeyCursor()` to `openCursor()` so deletion on sign-out is valid. The real
sign-out browser journey and uncaught-error assertion cover the regression.
Remove the patch when upgrading to a release containing the upstream fix.

## Production Chrome Acceptance, 2026-10-19

Browser access recovered after Chrome and desktop-app restart. Google client
registration and completed OAuth return passed. A generated production identity
covered signup/onboarding, customer/job creation, job-derived phone follow-up,
reschedule, manual phone log, reply/closure, templates/default/search/archive,
settings persistence, Free Beta billing, sign-out, invalid password, protected
return path, and valid password login. Mobile emulation exercised actual narrow
viewport layout, drawer navigation, customer edit/archive, follow-up panel, and
sessions. Marketing home/features/pricing/privacy/terms and login/signup redirects
also passed. No real customer outreach was performed.

A discovered local-midnight grouping defect now has regression tests and a
browser-timezone query contract. Latest checks: 65 unit tests/148 assertions,
36 integration tests/126 assertions, full monorepo and test-harness typechecks.
Actual email-submit browser events persisted in Logly at both auth locations.
Screenshot evidence and test limits are recorded in
`brain/handoffs/2026-10-19-production-browser-acceptance.md`.

This live Chrome pass does not substitute for native Android installation,
real operator activation, or queued email
delivery (Trigger credits remain unavailable). Older browser-disabled/OAuth
blocker notes in dated handoffs are historical.


## Isolated Preview Acceptance — 2026-10-19

Latest source checks: 71 unit tests / 163 assertions, 45 real local PostgreSQL
integration tests / 157 assertions, full monorepo and harness typechecks, scoped
Biome, whitespace validation, and a Ready Vercel Preview build. New integration
coverage includes exact-domain eligibility, concurrent single-use selection,
paid/membership staleness, client/grant revocation, platform-admin stripping,
expired references/authorizations, and credential lockout.

The restricted-runtime Preview build passed 17 HTTP checks, deployed Chrome
picker/draft/error/session checks, and a database audit proving no implicit
draft writes. The temporary grant was revoked and the browser returned to
sign-in. Fourteen production QA probes returned 404. Earlier full local browser
coverage remains 40/40; this pass does not claim a new full cross-browser Preview
matrix. Provider delivery, reviewed purge, physical Android installation, and
real beta activation remain unverified. New source fixes were deployed only to
Preview. See `brain/handoffs/2026-10-19-preview-qa-acceptance.md`.

## Operations Assistant — 2026-10-24

Use `bun run test:assistant` with a loopback isolated PostgreSQL database for the
19 assistant contract/database checks. `bun run test:assistant:e2e` refuses any
database except `afterservice_assistant`, starts a local Portless dashboard and
uses a synthetic model adapter through the real streaming/tools/auth path.
Real-model acceptance is an explicit separate opt-in and uses disposable
synthetic records only. See [the verification record](assistant-verification.md)
for configuration, measured provider results and the final browser evidence.
