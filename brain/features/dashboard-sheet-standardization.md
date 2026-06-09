# Feature: Dashboard Sheet Standardization

## Status
In progress. Primary dashboard sheet forms aligned on 2026-06-09.

## Scope
- Customer create/edit sheets.
- Job create sheet.
- Follow-up create, schedule, and work sheets.
- Template create/edit sheets.

## Architecture
- Sheets remain in `apps/dashboard/src/components/sheets`.
- Sheet open state remains URL-backed through existing domain hooks or nearby `nuqs` query state.
- Forms use `useZodForm` with API schemas where available.
- Fields use `@afterservice/ui/form` primitives and shared UI controls instead of raw labels, native selects, or direct `form.register` markup.
- Loading states use `apps/dashboard/src/components/sheets/sheet-form-skeleton.tsx` instead of centered text placeholders.

## Current State
- Template create/edit sheets already use shared shadcn-style form primitives.
- Customer create/edit sheets now use `FormField`, `FormItem`, `FormLabel`, `FormControl`, and `FormMessage`.
- Follow-up create and schedule sheets now use shared `Select` controls for customer/job/template/channel fields.
- Follow-up work sheet mini-forms now use shared form primitives.
- Job create sheet has the same descriptive sheet-header pattern as the other primary create sheets.
- Edit/work sheets now use shared skeleton loading states while fetching records.
- Schedule follow-up sheet descriptions avoid loading prose because fetch loading is represented by the sheet skeleton.

## Remaining Work
- Continue the page and filter/filter-option sweep.
- Audit any newly added non-sheet forms against the same primitive standard.
