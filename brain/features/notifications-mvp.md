# Feature: Notifications MVP Foundation

## Status
Implemented manual-send foundation on 2026-05-30.
Updated on 2026-06-11 so explicit manual email sends are queued through Trigger.dev jobs and delivered with Resend. As of 2026-10-24, ordinary non-production mail
defaults to console and exact `EMAIL_QA_DOMAIN_ROUTES` provide explicit QA routing.

## Scope
- `packages/notifications` defines message payload/provider contracts.
- Manual-only provider remains the default safe implementation.
- Resend-backed email delivery runs through the `notification` Trigger.dev task and is available only when callers pass `sendEmail: true`.
- Ordinary local/development/preview email defaults to console. Exact QA-domain
  routes may target an approved inbox; unmapped `.test` recipients fail closed.
  `TEST_EMAIL` is used by the internal analytics report, not notification routing.
- Follow-up `markSent` logs a `MessageLog` and `FollowUpEvent`.

## Architecture
- Reference standard: GND notification package architecture.
- Package owner: `packages/notifications/src/index.ts`.
- Board integration owner: `apps/api/src/routers/_app.ts`.
- Email delivery owner: `packages/jobs/src/tasks/notifications.ts`, which instantiates `@afterservice/notifications` inside the job worker.
- Production email smoke testing uses the internal `email-smoke-test` Trigger.dev task. It creates isolated test workspace/customer/follow-up records in the worker runtime database, sends one email to the explicit test recipient, and returns the resulting message-log status.
- Jobs runner: `packages/jobs` follows the GND Trigger.dev package pattern for `dev` and `deploy` scripts while preserving manual-send-only messaging.
- Local website/dashboard development should include the jobs runner: `bun run dev -f website dashboard jobs` runs `@afterservice/jobs` alongside the public website and dashboard.
- Jobs deploy mirrors GND's Prisma packaging step: `packages/jobs/prisma.ts` refreshes `packages/jobs/src/schema.prisma` from the shared DB schema before `trigger deploy`, and `trigger.config.ts` points Trigger's Prisma build extension at that task-local schema.
- Jobs deploy pins the Trigger.dev runtime to `node-22` because Prisma 7 requires Node `20.19+`, `22.12+`, or `24.0+`; Trigger.dev 4.0.1's default `node` runtime image uses Node 21 and fails during remote image dependency installation.
- Jobs deploy syncs non-secret runtime configuration. Production database/provider
  credentials are separately provisioned as non-revealable Trigger secrets; older
  CLI sync defaults to revealable values and must not overwrite those secrets.
- `packages/jobs/trigger-project.json` is the canonical non-secret project binding.
  Config and CLI wrapper use it; explicit `--project-ref` can override deliberately.
  `TRIGGER_PROFILE` selects the existing CLI login profile. Stale project IDs in
  shared dotenv profiles no longer select deployment targets.
- Local `trigger dev` also receives an ephemeral `0600` env file containing the
  allowlisted values from the active local-infra profile. This intentionally
  overrides Trigger.dev's remote project variables for the local worker and is
  deleted on worker shutdown.

## Safety Rule
2026-10-18: Explicit manual email logging rejects a missing Trigger key, and
rejects a development Trigger key in production, before writing sent state or
audit records. This prevents a configuration failure from appearing as a
successful contact. The production rollout found a development key in the
existing production source. The correct production key and existing worker
have since been verified through the authenticated Trigger CLI and configured
in the API/dashboard. Production Trigger rejects even a no-recipient task
because the organization has run out of credits; delivery remains unverified.
Queue rejection now returns `BAD_GATEWAY` before sent-state writes. Regression
tests cover both rejection without writes and sent state after queue acceptance.
Phone contact logging remains provider-free.

No automatic customer outbound messaging is sent in MVP. Real email is limited to explicit manual-send paths, queued through jobs, and dev/local mode must route recipients through `TEST_EMAIL` when it is set.
2026-06-18: The daily combined analytics review is an internal owner report sent directly from `packages/jobs` to `TEST_EMAIL`. It does not use `packages/notifications`, does not create customer-facing `MessageLog` records, and does not change customer notification delivery behavior.

## Local Verification

`bun run smoke:mvp` uses reserved `.invalid` recipient addresses so local
console delivery cannot accidentally contact a customer. It polls for the
asynchronous `MessageLog` and now passes through the real Trigger.dev task.

## Original credit blocker — 2026-10-24 (resolved by replacement below)

The configured project `proj_hquxdnfjtrqbkznhiapz` resolves to AfterService in
the School Clerk Trigger organization. In-app browser inspection confirms
its monthly $5 free credits are exhausted: new runs are blocked until
2026-11-01 or an upgrade. The displayed lowest paid plan is Hobby at $10/month.
The founder was handed the billing page; no purchase, upgrade, new task run or
email was submitted. At that point, actual follow-up delivery was unverified.

The existing production worker's non-secret `AFTERSERVICE_ENV_MODE` is
`production`; it was inspected in isolation and concealed again. Its database
and provider credentials were not revealed. The shared deploy profile instead
uses `prod` and has no explicit `EMAIL_DELIVERY_MODE`, so a future source deploy
would incorrectly select console delivery. The helper now recognizes both
production aliases. A regression first failed for `prod`, then all nine routing
tests and utils typecheck passed. Explicit console and local/preview behavior
remain covered. This source fix is now included in the replacement worker below.

The subsequent replacement acceptance used one explicit follow-up in an already excluded
internal workspace. Avoid the existing smoke task's creation of a fresh normal
workspace, which would contaminate adoption totals again. Verify queue acceptance,
provider acceptance and actual inbox arrival separately. Do not run a general
local worker against production or contact any other recipient.

## Zeroes & One replacement — 2026-10-24

The founder chose a replacement project in Zeroes & One. It is created and
worker `20261024.2` passes its production no-recipient probe. DB/Resend are
non-revealable secrets. Production app key rollout and delivered-email acceptance are complete; this
supersedes the pending upgrade choice. One dashboard-dispatched follow-up
completed in the new project and arrived in the approved founder inbox. See
`trigger-project-migration.md` and ADR 0025.
