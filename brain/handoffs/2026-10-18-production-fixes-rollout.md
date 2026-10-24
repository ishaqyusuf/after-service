# Production Fixes And Dashboard Hostname Rollout

Date: 2026-10-18
Status: Deployed; HTTP operator acceptance passed; provider/browser acceptance pending

## Deployment

Deployed directly from the verified working checkout to the existing Vercel
projects. No Git push, PR merge, production secret rotation, or local dotenv
edit was performed by this rollout.

Final deployments (all Ready; project aliases verified):

- Dashboard: `dpl_19aScyM7zLZ1zpk1Ro3odtp8Hbpg` (email intent analytics continuation).
- API: `dpl_EZwacEadmakhdQqQgNhxXBFBySZx` (cron continuation).
- Website: `dpl_HWzgrz3otcCYuXrxCQV2ZvCsGXeR`.

Attached `dash.afterservice.app` to the dashboard project, resolving Cloudflare
HTTP 525. Updated only non-secret production site/dashboard/API URLs and trusted
origins across all three projects. The legacy dashboard hostname redirects with
HTTP 308 to the canonical hostname and preserves paths/query strings.

## Verified

- HTTPS sign-in/signup pages, marketing pages, and marketing auth redirects.
- Real production signup and workspace onboarding with a clearly labelled
  synthetic `.invalid` identity.
- Dashboard session validation by both dashboard and standalone API.
- Authenticated overview, customers, jobs, follow-ups, templates, settings,
  and billing pages returned 200 over HTTP.
- Customer create/edit/search/archive; service job creation; template
  create/edit/default; job follow-up scheduling/rescheduling; atomic phone
  contact logs; reply/close/board/history; persisted workspace settings.
- Billing plan/limits reads; sign-out, real password sign-in, and session
  persistence. Unsafe return paths stream a refresh to `/`.
- API health, both tRPC mounts, exact-origin credentialed CORS, anonymous
  access rejection, guarded cron/webhooks, and absence of internal QA routes.
- Production email guard returned HTTP 412, retained scheduled state, and
  created no email message log. The verification follow-up was then closed
  and its synthetic recipient customer archived.
- Website Logly ingestion returned 202 with one accepted verification event.
- Local verification after the email queue-ordering fix: 34 PostgreSQL tests
  (110 assertions), 58 unit tests, both typechecks, and changed-file Biome
  checks passed.
  The earlier browser matrix passed 40 cases; production UI interaction has
  not been claimed while browser control is disabled.

## Production Schema Repair

Signup initially failed because `Session.qaAuthorizationId` was absent. A
read-only production diff showed only additive QA tables, nullable session
fields, indexes, and foreign keys missing. Historical migrations were not
recorded despite existing tables. The repository's confirmed-target
`bun run db:push --prod` applied the additive delta without data-loss flags.
The subsequent schema diff was empty and signup/onboarding passed. See
`brain/database/migrations.md`; migration baselining remains future maintenance.

## Email Findings

Automatic approval review rejected a bulk production credential export. No
such export occurred. The user approved a narrow two-key Trigger copy, but
Vercel's sensitive values were non-retrievable. With separate user approval,
only the existing local production Trigger values were configured in memory.
That source contained a development key, not a production key.

One approved email dispatch was attempted, returned 500, and produced no
message log. The development environment's runs list was empty. Delivery was
not observed, and no automatic retry occurred. The unsuitable newly added
dashboard key was removed. No local worker was started or payment attempted.

The API now rejects missing/development-only production email credentials
before sent-state/audit writes, with a regression test proving no writes.
The correct production key and deployed worker have since been verified and
activated. The organization has run out of Trigger credits. Queue rejection
now returns `BAD_GATEWAY` before sent-state writes, covered by regression tests
for both rejection and acceptance ordering.

## Remaining Acceptance

- Browser tools repeatedly report disabled in Work settings despite the user's
  stated intention to enable them. Interactive production UI acceptance remains.
- Google receives the correct new callback URI but returns
  `redirect_uri_mismatch`. Register
  `https://dash.afterservice.app/api/auth/callback/google` and the new origin in
  the existing Google OAuth client, then complete Google sign-in.
- Logly dashboard-origin allowlist and persisted-ingestion acceptance are
  complete; see Provider Continuation below.
- The production Trigger key and worker are verified through the authenticated
  CLI and active on API/dashboard. Trigger rejects tasks because the organization
  has run out of credits. Delivery remains unverified; no email was sent.
- Cron is now configured and verified through daily Vercel scheduling; see
  `2026-10-18-cron-beta-readiness.md`. The legacy webhook remains unconfigured
  (503 fail-closed). Paid checkout remains disabled for Free Beta.

The generated production verification workspace is retained for the unfinished
provider acceptance. Both follow-ups are closed and both customers are
archived. Fixture IDs and generated login credentials remain in a private
temporary file, not this report. Remove only those exact generated records
after acceptance; do not run a broad production test-data purge.

## Provider Continuation

The user explicitly requested completing provider setup and browser acceptance.
Browser inventory, a fresh tool session, and the direct production-browser
entrypoint still returned `Local browser use is disabled in Work settings`.
The app's own Settings window is protected from Computer Use, so settings
guidance was taken from official OpenAI browser-extension documentation.

Logly acceptance is now complete: the enabled `afterservice` registry record
`df240f25-a805-4a50-a386-cff97d4f7dd7` gained only the exact new dashboard origin,
with both original origins preserved in a scoped transaction against the
confirmed Logly production Neon target. Dashboard ingestion returned 202 and
event `bb18cc30-571b-48df-9a03-e85cbe381c60` was independently found in that
project's event table. No Logly source, schema, key, or other project changed.

The authenticated official Trigger CLI client resolved the exact Afterservice
project (`proj_hquxdnfjtrqbkznhiapz`), verified its existing production key and
deployed `notification` task (worker `20260618.7`), and configured only that key
and project ref in API/dashboard Vercel Production. Values stayed in memory;
no local dotenv file changed. Both deployments became Ready. The email attempt
still returned 500 with no run or message log. A bounded no-recipient task probe
then returned `You can't trigger a task because you have run out of credits.`
No probe run was queued. This also explained a second defect: the API wrote
sent state before queue acceptance. The fix defers that write and returns a
bounded `BAD_GATEWAY` error on rejection, with two regression tests.

The user explicitly chose to continue with browser access and Trigger credit
blockers documented. No further real email attempt or credit purchase was made.
The exact email verification follow-up was closed, its customer archived, and
an empty message log rechecked before sign-out. The queue-error fix is deployed
to all three apps; their Vercel builds are Ready with canonical aliases.
Post-deploy verification passed all 12 standalone API smoke checks and 18 HTTP
read/session checks: seven protected pages, six public pages (including their
canonical redirects), password sign-in/sign-out, standalone API session
validation, marketing login, and the legacy dashboard redirect. These checks
do not establish interactive browser acceptance or real email delivery.

## Brain Documentation Updated

- `brain/handoffs/2026-10-18-production-fixes-rollout.md`
- `brain/features/dashboard-hostname.md`
- `brain/features/notifications-mvp.md`
- `brain/api/contracts.md`
- `brain/database/migrations.md`
- `brain/engineering/testing.md`
- `brain/system/observability.md`
- `brain/product/roadmap.md`
- `brain/tasks/in-progress.md`
