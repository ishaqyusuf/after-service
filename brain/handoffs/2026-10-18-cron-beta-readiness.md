# Cron, Beta Preparation, And Email Intent Analytics

Date: 2026-10-18
Status: Requested cron/configuration/materials complete; excluded provider/browser gates remain

## Production Cron

- API deployment: `dpl_EZwacEadmakhdQqQgNhxXBFBySZx`, Ready.
- Registered enabled Vercel definition: `GET /api/jobs/follow-ups/mark-missed`,
  `0 7 * * *` (08:00 Africa/Lagos target; Hobby can invoke within that hour).
- A random production API `CRON_SECRET` was supplied directly to Vercel as a
  Sensitive value, held in memory during verification, never printed or saved.
  No local dotenv file or unrelated environment variable was changed.
- Vercel deployment/project metadata independently confirms the definition and
  enabled state. The first timer-driven invocation is still future; acceptance
  here exercises the same production handler manually with its real secret.
- Missing/incorrect credentials returned 401; query overrides returned 400;
  responses use no-store. The authenticated dry-run returned zero due items.
- Rescheduled the existing exact synthetic phone follow-up into the past. The
  cron changed one item to missed; the repeat run changed zero. Its existing
  message-log count stayed unchanged. The fixture was closed again and the
  synthetic session signed out. No customer message or test email was sent.
- Deactivated only the previous production Trigger schedule
  `sched_cz31y9ant5grkz3iym4ei`, after verifying its exact task and environment.
  Read-back confirmed inactive. Other schedules were unchanged. The source
  removes that declarative clock so a future worker deployment does not
  recreate it. Vercel is the sole overdue-state scheduler (ADR 0014).
- Recovery: inspect Vercel function logs for `follow-up-cron`/5xx, diagnose, then
  rerun through the platform or an authenticated request. Vercel does not retry
  failed cron invocations. Future cadence changes require a supported plan or
  a separately approved scheduler; no plan upgrade was made.

## Beta Kit

Entry point: `brain/product/beta/README.md`.

Prepared invite/confirmation/follow-up drafts, a 20-minute founder script,
operator quick start, feedback process/triage template, and prospect/activation
trackers. The first-session path uses password auth and manual phone logging.
Actual calls must happen before real contact is logged; sample walkthroughs do
not count as activation. Current Google/email/PWA limitations are explicit.

The reply channel is the founder's existing onboarding conversation, confirmed
per operator. Public `hello@afterservice.app` delivery/monitoring was not tested;
it is not the sole support route. No new external inbox/form was created and no
outreach was sent. Five real prospect selections and recruiting remain founder
work; tracker segment slots are not invented leads.

## Email Click Analytics

The user asked for explicit tracking of “continue with email.” Both email submit
buttons now emit `continue_with_email_clicked` through the existing Logly
adapter with channel, method, and `dashboard_sign_in`/`dashboard_sign_up` location.
It measures activation before validation, not auth success; existing signup
start/completion events remain. No credentials, email address, customer data,
or redirect path are included. Existing privacy/enable switches apply.

Dashboard deployment `dpl_19aScyM7zLZ1zpk1Ro3odtp8Hbpg` is Ready on
`dash.afterservice.app`. Both auth pages returned 200 and referenced client code
containing the event and corresponding form location. Two synthetic events
with `verification: true` returned 202 and were independently found under the
exact Afterservice Logly project:

- Sign-in: `373130f4-fde8-4421-a4fc-04e5f101a5d0`.
- Sign-up: `cfb64320-573b-4fce-bcf0-5d89aced8669`.

This proves deployed instrumentation and ingestion/storage acceptance. An actual
browser-button interaction remains unverified because browser access is excluded
from this task. No visual layout or form validation behavior changed.

## Checks

- 35 PostgreSQL integration tests / 121 assertions passed.
- 60 unit tests / 132 assertions passed.
- Full monorepo and test-harness typechecks passed.
- Scoped Biome checks passed for all 11 touched source/config/test files.
- 13 production API smoke probes passed; anonymous cron now returns 401 rather
  than unconfigured 503. The inactive legacy billing webhook remains 503.
- Production API/dashboard builds Ready, canonical aliases verified.
- Beta kit relative document links and diff whitespace checks passed.
- No Git commit/push, schema change, outbound invitation, or customer email.

## Remaining MVP Work

- Google callback registration and interactive production browser acceptance.
- Trigger credits and the one approved real email delivery verification.
- Founder selects/invites actual prospects, confirms their reply channel, and
  observes real onboarding/activation. Materials are ready; outcomes are not.
- Physical Android installation acceptance.
- Internal QA deployed-preview acceptance, routed email, and reviewed cleanup.
- Existing broad UI lint and migration-history baselining are maintenance work.

## Brain Files Updated

- `brain/handoffs/2026-10-18-cron-beta-readiness.md`
- `brain/handoffs/2026-10-18-production-fixes-rollout.md`
- `brain/decisions/0014-use-vercel-for-beta-follow-up-cron.md`
- `brain/api/endpoints.md`, `brain/api/contracts.md`, `brain/api/permissions.md`
- `brain/features/jobs-mvp.md`, `brain/features/auth-email-analytics.md`
- `brain/system/architecture.md`, `brain/system/observability.md`
- `brain/engineering/testing.md`
- `brain/product/roadmap.md`, `brain/product/beta-roadmap.md`
- `brain/product/beta/README.md`, `brain/product/beta/invite-copy.md`
- `brain/product/beta/onboarding-playbook.md`
- `brain/product/beta/feedback-process.md`, `brain/product/beta/recruiting-tracker.md`
- `brain/marketing/feedback.md`
- `brain/tasks/in-progress.md`, `brain/tasks/done.md`

No database documentation change is required: the schema and persisted business
meaning are unchanged; this activates the existing overdue status transition.
