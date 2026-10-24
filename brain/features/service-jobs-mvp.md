# Feature: Service Jobs MVP

## Status
Implemented for MVP on 2026-05-30.

Updated on 2026-06-10 to align the create-job sheet with Midday-style creatable autocomplete fields and form composition.

Updated on 2026-06-11 so inline new-customer creation from the job form can collect optional email and phone before creating the customer and job together.

## Scope
- Workspace-scoped job list and create/update APIs.
- Completed job logging with customer, title, category, completion date, value, and notes.
- One-click follow-up creation from a job.
- Job data appears in dashboard workflows and follow-up/template context.
- Create-job form uses creatable autocomplete for customer, service title, and service category. Customer creation appears as the first search result, then captures optional customer email and phone before creating/selecting the customer for the job.

## Architecture
- API owner: `apps/api/src/routers/_app.ts` `serviceJobs` router.
- UI owner: `apps/dashboard/src/app/jobs/page.tsx`.
- Dashboard server actions call tRPC procedures through `apps/dashboard/src/lib/trpc-server.ts`.
- Create sheet owner: `apps/dashboard/src/components/sheets/job-create-sheet.tsx`.
- Create form owner: `apps/dashboard/src/components/forms/job-create-form.tsx`.

## Rules
- Jobs always belong to the active workspace.
- Follow-ups created from jobs inherit the job customer and workspace.

## Verification
- `bun run typecheck`
- `bun run lint`
- `bun run build`


## Preview Quick Fill Dates — 2026-10-19

Job Quick Fill supplies Date objects to completed/next-follow-up controls,
matching ordinary form types. The previous string values left date pickers
visually empty. Unit and deployed Chrome checks pass. Fill/reset remain drafts
and require explicit Create; no job was created during the preview check.

## Assistant Job Values — 2026-10-24

Reviewed assistant job creation/update uses the existing canonical operations.
Jobs now persist currency alongside integer cents. Legacy/manual default is USD;
assistant accepts explicit USD/NGN/GBP/EUR/CAD and the jobs table displays the
saved currency. No automatic exchange or currency reinterpretation occurs.
