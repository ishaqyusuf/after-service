# Feature: Service Jobs MVP

## Status
Implemented for MVP on 2026-05-30.

## Scope
- Workspace-scoped job list and create/update APIs.
- Completed job logging with customer, title, category, completion date, value, and notes.
- One-click follow-up creation from a job.
- Job data appears in dashboard workflows and follow-up/template context.

## Architecture
- API owner: `apps/api/src/routers/_app.ts` `serviceJobs` router.
- UI owner: `apps/dashboard/src/app/jobs/page.tsx`.
- Dashboard server actions call tRPC procedures through `apps/dashboard/src/lib/trpc-server.ts`.

## Rules
- Jobs always belong to the active workspace.
- Follow-ups created from jobs inherit the job customer and workspace.

## Verification
- `bun run typecheck`
- `bun run lint`
- `bun run build`

