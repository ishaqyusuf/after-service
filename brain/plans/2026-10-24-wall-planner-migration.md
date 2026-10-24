# Wall planner implementation contract

2026-10-24 · implementation mode · selected by owner. Workers use Claude
`claude-opus-5-5`; Codex owns integration, review and browser acceptance.

## 1. Reference Compared

Target: website landing shell, care-landing, pricing and SEO-content routes;
dashboard sidebar/header/mobile menu, widgets, boards/follow-ups-board,
tables/core and four domain tables, URL hooks, sheets/dashboard-sheet-content,
follow-up-card-sheet, forms/follow-up-work-form and existing invalidations.

Canonical Midday root: `/Users/M1PRO/Documents/code/_kitchen_sink/midday`.
Compared dashboard customer/invoice server pages; invoice-header,
open-invoice-sheet, invoice-search-filter; use-invoice-params and filter hook;
sheets/invoice-sheet, invoice-sheet-header, invoice-content;
sheets/customer-create-sheet and customer-edit-sheet; modals/delete-api-key-modal.
Workers must additionally inspect matching invoice/customer table components,
invoice/form-context and relevant forms before editing their owned slice.

Accepted Workshop: marketing `4f92a91c-db40-438b-9ece-37026ade63e7`;
dashboard `98a41e00-e71d-4cfe-8030-12445392ad4e`. The archived sources under
Workshop `work/after-service/redesign/complete-ui/{marketing,dashboard}-01`
define visual composition. Current production source defines business truth.

## 2. Migration Principle

Use Wall planner's teal paper surfaces, pale navigation, Cal Sans display,
functional sans data, seven-day overview and labelled stages. Port composition
onto React/shadcn wrappers and existing tRPC. Never ship the preview mock engine.
Preserve concurrent work, current brand, assistant, localized Free/Business
prices, paid checkout configuration, auth, consent, analytics, SEO and PWA.

## 3. Filesystem Plan

- Website worker owns `apps/website/src` presentation files; split landing
  components rather than a monolithic renderer. Preserve pricing resolver logic.
- Foundation worker owns dashboard app CSS, sidebar/header/mobile menu/main-menu,
  scrollable-content, domain headers/search controls and `components/tables/*`.
- Workflow worker owns widgets, board, sheets/forms, status presentation,
  billing/settings/auth/onboarding presentation. No foundation-owned files.
- Shared shadcn primitives remain intact. Theme overrides live in app CSS.
- Parent owns this contract, Brain evidence and final integration corrections.

## 4. Route/Page Plan

Keep routes server compositional, current typed loaders/prefetch/HydrateClient,
Suspense/error boundaries and metadata. Global providers continue mounting URL
sheets/modals. No API/DB migration is needed for a presentation redesign.

## 5. Header And Open Button Plan

Clear page title, short supporting copy, wrapping search/filter/actions.
Existing OpenCustomer/Job/FollowUp/TemplateSheet controls retain domain URL state.
Keep primary creation reachable on phones. Navigation labels remain discoverable;
expanded desktop rail can collapse explicitly, mobile drawer closes on navigation.

## 6. Sheet Plan

Navigable create/edit/detail customer, completed job, follow-up work/schedule and
template editor remain sheets, following Midday customers/invoices. URL hooks
own selection/open/close; forms own validation, mutations and cache refresh.
Use shared dashboard sheet wrapper/header and domain content components.
Follow-up's multi-action work surface must have explicit sheet header, content
and shared form context, matching the invoice editor split. Preserve error,
missing-record and loading states. Full available width on phones, scrollable
body, visible close, keyboard focus, Escape and safe-area footer.

Short destructive confirmations use AlertDialog/Dialog; search remains a modal.
Do not convert full editors into modals. Import/export modals are omitted because
no import/export workflow is requested or currently supported. Settings and
billing stay pages; checkout remains its existing provider handoff.

## 7. Form-To-Sheet Plan

Reuse current create/edit forms and schemas. No new data entry path or endpoint.
Keep successful save/close behavior and centralized useDashboardInvalidations.
Errors remain recoverable in-place; no false successful saves. Don't discard
onboarding recovery or assistant-reviewed action behavior.

## 8. Filter/Search/URL State Plan

Keep nuqs filters, sort and selection IDs, deferred search, filter chips and clear.
Preserve shared links, refresh/back behavior and column preference persistence.
Mobile board stage selection is view-only local state unless existing URL state
already owns it; no silent server filter changes.

## 9. Table Plan

Retain typed infinite queries/cursors, virtual rows, sticky identity/actions,
column DnD/resize/visibility and existing selection. Confine horizontal overflow,
provide a small-screen scroll cue and accessible table labels. Preserve domain
skeleton, empty/no-results/error, infinite-loading states. No arbitrary new
selection or bulk operation when the domain doesn't support it.

## 10. Columns And Row Actions Plan

Keep IDs, widths and API-derived types. Identity opens current URL sheet;
interactive controls stop propagation. Clear menus and keyboard/touch affordances.
Status labels carry text and shape as well as color; retain domain semantics.

## 11. Bottom Bar / Bulk Actions Plan

Restyle existing selected-count/action bars. Preserve deselect and supported
actions, no new mass-delete/export operations. If a domain has no selection,
omit a bottom bar rather than inventing one.

## 12. API/Data Plan

Keep schemas/routers/queries and authorization unchanged. Week strip uses real
overview calendar data (or explicitly links days without invented totals).
Use operator timezone. Never infer complete day totals from a truncated recent
list. Current regional billing/country resolver is authoritative over the older
Workshop 'planned checkout' copy. Mutations retain exact invalidations.

## 13. Testing And QA Plan

Run root `bun run typecheck`, narrow lint on touched files, website/dashboard
builds and relevant existing tests. Start local stack with
`bun run dev --local --filter dashboard website`; use Portless hostnames.
Inspect desktop and 320/390px, light/dark, keyboard/focus, navigation, search,
tables, create/edit/work sheets, confirmation dialogs and marketing pricing.
Use local QA fixtures only; no production writes/payments/provider sends.
Compare integrated screenshots against both selected previews. Record actual
results and justified omissions below before Workshop implementation receipts.

## 14. Open Questions

None blocks implementation. Product truth comes from latest source/Brain; where
the archived preview is stale, preserve live behavior and document the difference.

## Execution And Final Conformance Audit

- [x] Exact revisions selected in shared Workshop.
- [x] Required reference/target comparison and migration contract prepared.
- [x] Marketing implemented and reviewed.
- [x] Dashboard foundation/tables implemented and reviewed.
- [x] Dashboard workflow/sheet-modal distinction implemented and reviewed.
- [x] Checks and desktop/mobile acceptance complete.
- [x] Every applicable contract item audited against exact Midday references.
- [x] Brain updated and Workshop implementation evidence recorded.

### Final conformance result

All applicable items pass. Source comparison: Midday customer/invoice server pages,
headers/open buttons/filter hooks; invoice sheet/header/content/form-context;
customer edit/create sheets and destructive dialogs; invoice/customer core and
domain tables, columns, menus, bottom bars, skeleton and empty states. Target
files retain these responsibilities and the real API-derived types.

- Routes compose/preload/hydrate; overview now prefetches the complete board query
  and uses Suspense for matching server/client data. App/package boundaries and
  shared shadcn sources are intact.
- Domain URL hooks, query cursors, virtualization, sticky identity/actions,
  column preferences, DnD, resizing and search/sort/filter behavior remain.
  Keyboard identity buttons and keyboard column resizing supplement pointer use.
- Follow-up sheet supports the required four-file split. Opening another record
  never shows previous-record form data. Closing retains the same query data only
  through the exit animation. Phone width/focus/tab controls and confirmation
  default focus were inspected in the real app.
- Editors/details remain sheets; search and short archive/remove confirmations
  are dialogs. Settings/billing remain pages. Existing assistant and onboarding/
  password recovery behavior are preserved.
- UI helper formatting belongs in `utils/follow-up-dates.ts`; no new DB/API rule
  or endpoint is introduced. Central invalidations now also refresh overview.
- PWA development caching and stale public pricing/provider wording were corrected
  during review; regression tests protect local chunk freshness and production
  offline caching.
- Validation: 15-package typecheck, test typecheck, 149-file scoped Biome,
  180 unit tests/476 assertions, both optimized builds, static PWA checks,
  zero Impeccable detector findings and whitespace check pass. All 20 desktop/
  Pixel phone browser cases are covered successfully after targeted selector and
  month-boundary test corrections. Manual 320/390px and desktop light/dark review
  passes; exact checks/limits are in the feature record.

Justified omissions: no week job totals/chips from the capped recent-job query;
no new bulk/import/export/selection workflow absent from the domain; no rewrite
of accepted assistant business behavior or removal of unrelated legacy files.
The older preview's disabled paid action is superseded by current source-owned
Free/Business checkout. Implementation is on the isolated
`codex/wall-planner-redesign` branch in commits `80a2079` and `ea0aa45`, pushed
to origin. No PR exists and deployment remains in progress.

Brain impact: updated this contract, the Workshop feature record, marketing
history, ADR 0026 and task state. Root PRODUCT.md/DESIGN.md capture the accepted
system. No database/API documentation change is required because their source
contracts are unchanged; local schema readiness only synced existing merged code.

Workshop receipts: marketing `6da342ba-9a03-4758-a385-52eb11eb5637`;
dashboard `d90c1bf2-baa7-4d62-b78e-2047b09ad2e7`. Both exact selected revisions
are recorded as implemented in the isolated release branch; no live release is
claimed.
