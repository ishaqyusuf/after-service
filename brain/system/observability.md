# Observability

## Purpose
This file captures the MVP observability baseline for afterservice production readiness.

## MVP Logging
- 2026-10-24: Private Oversight v1 read endpoints and the matching portfolio
  adapter are implemented. Logly owns traffic; Oversight owns operational
  summaries/directories. Initial live inspection found Afterservice registered
  but not connected. Source verification and production activation are tracked
  separately in `brain/features/oversight-integration.md`.
- The daily Vercel follow-up cron emits `follow-up-cron` with aggregate
  processed/missed counts and completion time. It records no recipients or
  customer data. Check function errors/5xx responses; failed runs require
  investigation and a manual rerun because Vercel does not retry cron failures.
- API, dashboard, website, cron, and webhook runtime logs should be retained by the deployment platform.
- `LOG_LEVEL=info` is the default production setting.
- Billing webhooks persist every accepted provider event in `BillingEvent`.
- Follow-up status changes, reschedules, replies, closes, and manual sends are persisted as `FollowUpEvent` records.
- Manual outreach creates `MessageLog` records; automated outbound messaging remains disabled unless explicitly configured.

## Marketing Analytics
- 2026-10-18: Email sign-in/signup submit buttons emit
  `continue_with_email_clicked`, with only channel, method, and form location.
  It measures button activation before validation, not successful auth. Existing
  signup conversion events remain; see `brain/features/auth-email-analytics.md`.
- 2026-10-18: Added only `https://dash.afterservice.app` to the enabled
  Afterservice Logly project's production origin allowlist, preserving both
  existing origins. Dashboard ingestion now returns 202 with one accepted
  verification event; website ingestion also succeeds. No collector credential
  was exported or rotated.
- 2026-08-31: Logly replaces OpenPanel as the shared first-party analytics
  platform. Afterservice remains a thin product adapter and first pilot.
- The public website measures one eligible visitor-day per browser per
  Africa/Lagos date plus explicit bounded product events. Logly discovers new
  valid event names automatically; no dashboard catalog setup is required. It does not capture
  automatic pageviews, DOM attributes, outgoing links, sessions, country, or
  detailed device data.
- Browser batches use a same-origin route and project-scoped `client-ingest`
  key. Trusted server events use `server-write`; report reads use `read`.
  Secrets are never exposed through `NEXT_PUBLIC_*` variables.
- Collection is disabled until the explicit Logly kill switch is enabled. It is
  normally enabled in production, and may be enabled deliberately in the local
  profile for Docker-backed end-to-end QA. GPC/DNT suppress optional browser
  tracking in every environment.
- Local QA uses a local Logly project and sends through the same Afterservice
  route to `logly.localhost`; local scoped keys stay only in ignored
  `.env.local` and are never reused in production.
- `bun run smoke:logly:local` sends a unique, uncatalogued event through the
  running Afterservice same-origin route and polls Logly's scoped read API until
  the same event is visible under project `afterservice`.
- `bun run smoke:mvp` is pinned to the shared local-infra profile and verifies
  Better Auth signup/onboarding, protected navigation, workspace-scoped CRUD,
  the queued notification worker, permissions, cron protection, and webhook
  idempotency against local services.
- 2026-09-01: the npm-backed `0.2.0` integration is live on both production
  surfaces. Chrome confirmed browser `site_visit` ingestion and newly named
  same-origin smoke events under Personal / Afterservice. OpenPanel runtime
  dependencies and Vercel variables were removed.
- Production auth diagnostics fail closed in application code whenever
  `NODE_ENV=production`, even if `AFTERSERVICE_AUTH_DEBUG` is accidentally set.
  The production environment also keeps `AFTERSERVICE_AUTH_DEBUG=false`.
- 2026-09-01: Vercel redacts variables marked Sensitive during environment
  pulls, so an empty pulled value is not evidence that the configured value is
  empty. After explicit approval, Production and Preview received distinct
  randomly generated `BETTER_AUTH_SECRET` values and the dashboard was deployed
  as `dpl_782fShBGSkGRw9rbYeDrw5LMYf6j`. The build emitted no Better Auth
  secret-length or entropy warnings, and `/api/auth/get-session` responds with
  the expected anonymous result after the intentional session invalidation.
- Dashboard anonymous identity/group plumbing is not part of the pilot. Raw
  user/workspace identity and PII must not be sent as event properties.
- `packages/jobs` continues the combined owner report at `08:00 Africa/Lagos`.
  Traffic data comes from Logly while product activity/totals come from the
  Afterservice database.
- Missing Logly configuration does not fail the report; database metrics remain
  available and the report records why traffic analytics is unavailable.

## Error Monitoring

- 2026-10-18: A Bun patch for `@ishaqyusuf/logly-core@0.2.0` fixes IndexedDB
  queue clearing on sign-out (`openCursor`, allowing record deletion). Browser
  tests assert that sign-out produces no uncaught exception. Remove the patch
  after adopting a release with the upstream fix; see
  `brain/engineering/testing.md`.
- Sentry follows the Midday dashboard pattern for `@afterservice/dashboard`.
- `NEXT_PUBLIC_SENTRY_DSN` is documented in `.env.example` for browser, server, and edge SDK initialization.
- 2026-06-11: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are configured in the local production env and Vercel production.
- 2026-06-11: Dashboard exposes `/sentry-example-page` publicly so production error capture can be verified from `https://dashboard.afterservice.app/sentry-example-page`.
- Production builds wrap the dashboard Next config with `withSentryConfig`; `SENTRY_ORG` and `SENTRY_PROJECT` are read from the environment.
- Source maps use `SENTRY_AUTH_TOKEN` at build time and prefer `SENTRY_RELEASE`, then `GIT_COMMIT_SHA`, for release naming.
- A production deploy should configure Sentry alerts for API/dashboard exceptions before live customer data is collected.

## Alerts
- Alert on repeated 5xx responses from `api.afterservice.app` and the dashboard's same-origin handlers.
- Alert on Lemon Squeezy webhook verification or processing failures.
- Alert on failed cron/job endpoint runs.
- Alert on failed `daily-analytics-review` Trigger.dev runs.
- Alert on database connection saturation or migration failures.

## Health Checks
- API health: `GET https://api.afterservice.app/health`.
- Cron dry-run: `POST https://api.afterservice.app/api/jobs/follow-ups/dry-run` with `CRON_SECRET`.
- Scheduled state processing: `GET https://api.afterservice.app/api/jobs/follow-ups/mark-missed`
  with the production API `CRON_SECRET`; daily 08:00 Africa/Lagos target window.
- Lemon webhook target: `POST https://api.afterservice.app/webhooks/lemon-squeezy`.
- Standalone API deployment checks: `bun run smoke:api`.
- Local Afterservice-to-Logly route: `bun run smoke:logly:local` while both
  shared local-infra profiles are running.
