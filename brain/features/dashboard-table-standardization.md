# Feature: Dashboard Table Standardization

## Status
In progress. Empty-state alignment, filter payload cleanup, customer tag filters, template channel filters, table settings hydration, and infinite prefetch alignment updated on 2026-06-09.

## Scope
- Customers, jobs, follow-ups, and templates tables should use a shared Midday-style empty/no-results pattern.
- Empty-state primary actions should open the correct create sheet for the current domain.
- No-results actions should clear only table filter params, not unrelated sheet or detail state.
- Table filter payloads should match the API router inputs exactly.

## Architecture
- Shared empty-state owner: `apps/dashboard/src/components/tables/core/empty-states.tsx`.
- Shared skeleton owner: `apps/dashboard/src/components/tables/core/table-skeleton.tsx`.
- Domain wrappers:
  - `apps/dashboard/src/components/tables/customers/empty-states.tsx`
  - `apps/dashboard/src/components/tables/customers/skeleton.tsx`
  - `apps/dashboard/src/components/tables/jobs/empty-states.tsx`
  - `apps/dashboard/src/components/tables/jobs/skeleton.tsx`
  - `apps/dashboard/src/components/tables/follow-ups/empty-states.tsx`
  - `apps/dashboard/src/components/tables/follow-ups/skeleton.tsx`
  - `apps/dashboard/src/components/tables/templates/empty-states.tsx`
  - `apps/dashboard/src/components/tables/templates/skeleton.tsx`

## Current State
- Domain tables now wrap the shared empty/no-results component.
- Follow-up empty state opens `createFollowUp`.
- Template empty state opens `createTemplate`.
- No-results states clear the matching filter hook for each table.
- Customer, follow-up, and template table searches now send `search` to their routers instead of URL-only `q`.
- Jobs table filters now normalize empty URL values to `undefined` before calling the service jobs router.
- Customer filter params now expose search and tag filters backed by matching API predicates.
- Customers, jobs, follow-ups, and templates route fallbacks now render domain table skeletons.
- Follow-up table sticky/non-reorderable config now uses the real `customer` column ID.
- Customers, jobs, follow-ups, and templates now pass URL sort state through server prefetch, client table queries, and allowlisted API router order clauses.
- Sort toggling now starts new columns at ascending, then cycles ascending, descending, and cleared.
- Follow-up history filters now support status, channel, and due-date range with matching API predicates.
- Template filters now support channel filtering with matching URL params, table query input, and API router predicates.
- Customer search now matches name, company, email, phone, and exact tag values instead of name only.
- Customer filters now support tag filtering with matching URL params, table query input, route prefetch, filter chips, and API router predicates.
- Customers, jobs, follow-ups, and templates route pages now load persisted table settings from the table-settings cookie and pass them into the table components.
- Customers, jobs, follow-up history, and templates route pages now prefetch table data with `infiniteQueryOptions` to match their `useSuspenseInfiniteQuery` table consumers.

## Remaining Work
- Continue page consistency audit for non-table dashboard pages.
