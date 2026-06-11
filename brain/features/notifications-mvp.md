# Feature: Notifications MVP Foundation

## Status
Implemented manual-send foundation on 2026-05-30.
Updated on 2026-06-11 so explicit manual email sends are queued through Trigger.dev jobs and delivered with Resend, with `TEST_EMAIL` overriding recipients outside production.

## Scope
- `packages/notifications` defines message payload/provider contracts.
- Manual-only provider remains the default safe implementation.
- Resend-backed email delivery runs through the `notification` Trigger.dev task and is available only when callers pass `sendEmail: true`.
- `TEST_EMAIL` redirects all outbound email recipients in dev/local mode so the first connected email test cannot accidentally reach a customer.
- Follow-up `markSent` logs a `MessageLog` and `FollowUpEvent`.

## Architecture
- Reference standard: GND notification package architecture.
- Package owner: `packages/notifications/src/index.ts`.
- Board integration owner: `apps/api/src/routers/_app.ts`.
- Email delivery owner: `packages/jobs/src/tasks/notifications.ts`, which instantiates `@afterservice/notifications` inside the job worker.
- Jobs runner: `packages/jobs` follows the GND Trigger.dev package pattern for `dev` and `deploy` scripts while preserving manual-send-only messaging.
- Local website/dashboard development should include the jobs runner: both `dev:websites` and `dev:websites:portless` run `@afterservice/jobs` alongside the public website and dashboard.
- Jobs deploy mirrors GND's Prisma packaging step: `packages/jobs/prisma.ts` refreshes `packages/jobs/src/schema.prisma` from the shared DB schema before `trigger deploy`, and `trigger.config.ts` points Trigger's Prisma build extension at that task-local schema.
- Trigger.dev project selection is env-driven: `TRIGGER_PROJECT_ID` supplies the project ref, and `TRIGGER_PROFILE` optionally selects the CLI login profile for jobs `dev`/`deploy`. If the CLI says a project ref is missing under the `default` profile, create/switch to the correct Trigger.dev profile and update the env ref rather than changing task code.

## Safety Rule
No automatic customer outbound messaging is sent in MVP. Real email is limited to explicit manual-send paths, queued through jobs, and dev/local mode must route recipients through `TEST_EMAIL` when it is set.
