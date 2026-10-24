# Complete UI redesign workshop

Date: 2026-10-24
Status: Wall planner implemented and reviewed; isolated production release is in progress.

## Requested outcome

Develop three coordinated design families, each with a marketing system and an
operator dashboard system, through the existing shared Workshop application.
The user confirmed that “3D direction” means three alternatives, not 3D artwork.
Use Workshop, Impeccable, and Copywriting; author with Claude Opus 5.5, allowing
another available Opus only if necessary with exact model disclosure.

## Constraints

- Make a substantial visual improvement. The incumbent appearance is evidence
  of product behavior, not the visual reference for this exploration.
- Preserve Bun/Turbo app/package boundaries, Next.js, existing Tailwind/shadcn
  wrappers, TanStack table architecture, sidebar, sheets/forms, routes and tRPC
  behavior. Avoid a costly architectural rebuild.
- Prioritize mobile responsiveness, readable copy, simple navigation and
  non-technical operators.
- Keep marketing claims grounded in current product availability. The core
  workflow records customers, completed jobs, planned check-ins, manual contact,
  replies and outcomes. Do not invent endorsements or provider automation.
- Treat the separate logo workshop and its selection history independently;
  this exploration does not authorize replacing the production mark.

## Workshop source and review boundary

Project: `after-service` in `https://workshop.localhost`.

Source: `/Users/M1PRO/Documents/code/workshop/work/after-service/redesign/complete-ui/`.

The existing catalog, archived revisions and accepted decisions must be
preserved. Publication is exploration. Record a human-selected exact revision
before implementing it in product source, then record implementation evidence
after integrated verification. The owner subsequently selected Wall planner for both surfaces; the local implementation is documented below.

## Progress

### Historical Workshop pricing steering, 2026-10-24

The user asked this redesign to incorporate the information in the chat
“Fix location-based pricing currency”. Read that chat's latest direct human
instruction: update the pricing page to Free and Business with the lower
prices, list AI assistant and WhatsApp as Coming soon, and keep paid checkout
disabled. This supersedes the earlier proposal-only state read at kickoff.

Use fixed Business monthly prices per workspace: NGN 5,000; USD 7 for US and
unsupported/unknown-country fallback; GBP 5; EUR 7 for supported euro countries;
CAD 10. These are deliberate regional price points, not live FX conversions.
Keep country-based currency resolution, honest fallback text and consistent
marketing/dashboard context. Any Workshop country control is simulation for
comparison, not a proposed public manual selector. Customer messaging delivery
charges remain separate; do not promise unbounded AI usage or working WhatsApp
connection. Production pricing implementation is owned by the other active
chat; this task carries the approved content into its design studies.

## Published comparison

- Marketing: https://workshop.localhost/after-service/marketing/system-redesign
- Dashboard: https://workshop.localhost/after-service/dashboard/system-redesign

| Family | Direction | Marketing revision | Dashboard revision |
| --- | --- | --- | --- |
| 01 | Wall planner | v2 `4f92a91c-db40-438b-9ece-37026ade63e7` | v7 `98a41e00-e71d-4cfe-8030-12445392ad4e` |
| 02 | Service journal | v2 `dd478401-3b4a-46cd-a31b-25aa3aaf9fcd` | v5 `a4ba3f4f-74e2-4ae7-bf53-7e9b6410d6a2` |
| 03 | Signal desk | v3 `fdb5e61f-f3be-48e7-80f6-546f33cce4d3` | v5 `2987d8d9-7ab9-42f2-a406-0f8aa82b6681` |

01 was the agent recommendation and is now the owner-selected direction for
clear operation and the lowest integration cost. 02 uses a warm editorial journal with due work first; 03 uses a cobalt
marketing stage and a denser dashboard with a graphite sidebar. Both exact 01 revisions were selected through the catalog before implementation. Earlier revisions remain archived.

Each marketing study includes Home, Features, Repair shops, Pricing and Guide.
Each dashboard study includes all seven existing navigation sections, detail
sheets/forms and a component guide with tokens and UI states. Shared sample
data and interaction logic keep the comparison fair. Both themes and phone
presets are available in the collapsible Workshop configuration panel.

## Authorship and assembly

Both Claude authoring passes used `claude-opus-5-5`, confirmed by CLI
initialization and response metadata. The first pass produced the dashboard
engine, renderer, data and base styles; it was checkpointed to avoid repeating
shared behavior. The completed second pass authored the remaining visual
systems and marketing renderer. Codex assembled the previews, integrated the
later approved pricing into dashboard Billing, and corrected rendered issues.
The source retains generation streams, `generation-evidence.json`, DESIGN.md,
the copy deck and its pricing correction, INTEGRATION.md and publication.json.

Each revision has one HTML entrypoint. The product renders in that entrypoint's
`product=1` mode, keeping the existing Workshop viewer from inventing an extra
screen-selection step. Thumbnail mode hides configuration controls. Original
inner templates are preserved outside the published source folders.

## Verification and limits

- All six source bundles passed local-asset validation and JavaScript syntax
  checks. Fonts and configuration assets are bundled.
- All three compositions were visually inspected at desktop and phone sizes;
  final packaged entrypoints were checked at 320px with no document overflow.
- The five marketing page modes and eight dashboard views (seven sections plus
  component guide) were checked at 320px. Marketing 01 also received the full
  five-page 390px check; other families received representative 390px checks.
- Exercised shared navigation, customer search/details, required-field errors,
  local customer save, mobile menu and contact logging into Waiting. Checked
  detail-sheet/sidebar behavior in Signal desk as well.
- Tested marketing workflow tabs, local signup validation/confirmation and
  mobile menu. All five public page modes were reachable.
- Checked all six regional/fallback dashboard prices, populated/empty/loading/
  error states, dark themes, mobile sizing and configuration collapse/reopen.
  Final packaging smoke retained page, currency and theme handoff.
- Fixed phone header overflow, task-row wrapping, sheet alignment, editor and
  component-guide min-width constraints, and a hidden comparison-table caption
  escaping its scroll region. Corrected component-guide family labels.
- Verified both permanent comparison routes and all three option links in each.
  Browser viewport overrides were reset; the shared viewer remains available.

The checks above describe the archived static studies. They do not establish
connected product behavior. The implementation acceptance below covers the real
local application.

## Accepted implementation, 2026-10-24

The user selected Wall planner for marketing and dashboard and requested multiple
Opus workers, Codex review, mobile acceptance and Midday sheet/modal conformance.
Three disjoint Claude CLI workers completed successfully using exact model
`claude-opus-5-5` (initialization, response and final canonical-model metadata).
Codex inspected their source changes, repaired integration issues and ran all QA.

- Shared visual rules: root `PRODUCT.md` and `DESIGN.md`; ADR 0026.
- Execution contract and final audit:
  `brain/plans/2026-10-24-wall-planner-migration.md`.
- Marketing uses the selected split hero, keyboard-operable sample record,
  ruled story/board/audience, two regional plan cards, FAQ and teal closing band.
  Feature, solution, guide and legal pages share the system. Server currency
  resolution, price/auth handoff, analytics, SEO and PWA remain in place.
- Dashboard uses app-local light/dark tokens, self-hosted Cal Sans display,
  system interface fonts and the current shared brand. Navigation has an explicit
  persisted collapse control and phone drawer. All four existing TanStack tables
  retain queries/cursors, virtualization, resize/reorder/visibility, sticky actions,
  URL search/filter/sort, skeletons and empty/no-result states.
- The week planner and due/replied/waiting panels use the complete existing
  timezone-scoped board query. Recent-list samples never stand in for totals.
  Overview facts use server counts; mutations invalidate overview and board/list
  caches. Suspense hydration prevents initial skeleton/data mismatches.
- Navigable record work remains URL-backed sheets. Follow-up wrapper/header/
  content/form-context follow Midday invoices. Forms preserve validation,
  mutations and errors. Phone logging hides irrelevant email fields; an email
  draft starts without a fictitious recipient. Sheets have visible close,
  scrolling body, safe-area spacing and opener-focus restoration. Previous data
  is retained only while closing, preventing a false missing-record flash.
- Customer archive and permanent template removal use AlertDialog in both editor
  and table actions. Search is a transient modal, now actually mounted. Billing
  and settings remain pages. Current Assistant navigation and reviewed workflows
  are preserved.
- Current Free/Business checkout implementation supersedes the historical study's
  disabled-checkout wording. Existing public AI/WhatsApp Coming soon listings
  remain source-owned. Unsupported countries still use USD; fallback text now
  describes current display rather than a planned checkout.
- PWA shell cache version is v4. Local Next development chunks bypass cache to
  prevent stale JS/CSS after edits. Production hashed assets and offline icon
  caching retain the existing behavior.

### Integrated verification

- `bun run typecheck`: all 15 packages pass.
- `bun run test:typecheck`: pass.
- Scoped Biome: 149 changed/relevant files pass, no findings.
- `bun run test:unit`: 180 tests / 476 assertions pass. Includes timezone/date and
  local-versus-production service-worker cache regressions.
- Optimized website and dashboard builds using the local profile: pass. These
  commands do not deploy. Static PWA manifest/service-worker/icon checks pass;
  native device installability is not claimed.
- All 20 existing Chromium/Pixel phone browser cases pass across the initial run
  and targeted reruns. The first run passed 16; selectors were narrowed to
  distinguish board cards from accessible table buttons, then 2 direct-creation
  cases passed. The final 2 complete job/contact/reply/closure journeys passed
  after correcting the test's calendar navigation across the current month end.
  Application hydration errors were fixed before this accepted run.
- In-app desktop light/dark review and 320/390px checks cover all eight current
  dashboard sections (including Assistant), marketing home/pricing/features/
  feature detail/solution/guide/legal families, phone navigation, record tabs,
  stage switching, contained table scrolling/actions, full-width sheets,
  work tabs, Escape/focus return, confirmation cancellation, search and persisted
  sidebar collapse. No horizontal document overflow was observed.
- Impeccable detector: zero findings. `git diff --check`: pass.
- Local schema readiness synced the already-merged schema to the guarded loopback
  QA database. This redesign adds no schema/API/permission/entitlement contract.
- Manual QA used two exact generated local identities (one partial seed, one
  complete six-customer/job/follow-up fixture). Both identities/workspaces were removed by exact IDs and a final read found zero remaining. No production data, customer outreach or payments were used.

### Intentional adaptations and limits

- No job chips in the week strip: the existing recent-job response is capped at
  five and cannot establish complete per-day job totals.
- No new bulk/import/export workflows or row-selection state: these domains do
  not support them. Existing architecture remains ready for future domain work.
- Current Assistant, auth/onboarding recovery and paid checkout behavior take
  precedence over older preview copy. No providers are enabled by this redesign.
- Existing unused legacy presentation files with concurrent changes were retained;
  they are not imported into the new overview/homepage compositions.
- This is a local implementation; no commit, PR, push or deployment was requested.
  Firefox, WebKit, production-scale data-volume benchmarking and physical-device installation were not rerun in this slice.

Screenshots: task visualization directory contains
`wall-planner-dashboard-implemented.png`, `wall-planner-dashboard-sheet-mobile.png`
`wall-planner-marketing-mobile.png` and `wall-planner-marketing-implemented.png`.

Workshop implementation receipts: marketing
`6da342ba-9a03-4758-a385-52eb11eb5637`; dashboard
`d90c1bf2-baa7-4d62-b78e-2047b09ad2e7`. Both catalog records are implemented
against the exact selected revision IDs. The shared viewer remains available.
