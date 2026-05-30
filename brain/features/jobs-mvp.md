# Feature: Jobs MVP Foundation

## Status
Implemented dry-run foundation on 2026-05-30.

## Scope
- Find due follow-ups.
- Mark overdue/missed follow-ups.
- Dry-run job for missed follow-up processing.
- Cron-protected API endpoint for dry-run and missed-state execution.

## Architecture
- Package owner: `packages/jobs/src/index.ts`.
- API endpoint owner: `apps/api/src/index.ts` at `POST /api/jobs/follow-ups/dry-run`.
- Database access comes from `@afterservice/db`.
- The endpoint is internal-only and requires `CRON_SECRET`.

## Safety Rule
Jobs do not send messages. They discover/update follow-up state only.

## Verification
- `bun run smoke:mvp` checks unauthorized cron access is rejected and authorized dry-run requests return an OK job result.
