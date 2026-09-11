# Feature: Jobs MVP Foundation

## Status
Implemented dry-run foundation on 2026-05-30.

## Scope
- Find due follow-ups.
- Mark overdue/missed follow-ups.
- Dry-run job for missed follow-up processing.
- Cron-protected API endpoint for dry-run and missed-state execution.
- Send an internal daily combined analytics review to `TEST_EMAIL`.

## Architecture
- Package owner: `packages/jobs/src/index.ts`.
- API endpoint owner: `apps/api/src/index.ts` at `POST /api/jobs/follow-ups/dry-run`.
- Database access comes from `@afterservice/db`.
- The endpoint is internal-only and requires `CRON_SECRET`.
- Scheduled Trigger.dev owner-report task: `packages/jobs/src/tasks/analytics-review.ts` at `08:00 Africa/Lagos`.
- The analytics review queries the project-filtered Logly events API with a scoped
  read key and aggregates platform-wide Prisma counts for jobs, customers,
  templates, follow-ups, messages, users, workspaces, and top workspace activity.
- The analytics review is partial-tolerant: missing Logly env marks website
  analytics unavailable while still sending/returning database metrics, and
  missing Resend/email env skips delivery while returning the database summary
  and missing-key reasons in the Trigger.dev run output.

## Safety Rule
Jobs do not send messages. They discover/update follow-up state only.
The daily analytics review is an internal owner email only. It sends directly to `TEST_EMAIL`, including in production, and does not contact customers or create workspace message logs.

## Verification
- `bun run smoke:mvp` checks unauthorized cron access is rejected and authorized dry-run requests return an OK job result.
- The same smoke runs against the shared local-infra profile and waits for the
  Trigger.dev notification task to persist its `MessageLog`, proving the local
  worker and web/API processes share the Docker PostgreSQL target.
- `bun --filter @afterservice/jobs typecheck` should cover the daily analytics task.

## Local Runtime Isolation

Trigger.dev fetches remote project variables during `trigger dev` and normally
places them after the parent process environment. The Afterservice launcher
therefore passes a permission-restricted temporary env file generated from the
resolved local-infra profile. Explicit-file values win, and the file is removed
when the worker exits. `import-in-the-middle@1.11.0` is a direct jobs dev
dependency because the generated Trigger.dev worker resolves it at runtime
under Bun's isolated dependency layout.
