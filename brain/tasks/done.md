# Done

## Purpose

This file records completed work.

## Completed

### Dashboard Overview Upgrade

Completed: 2026-06-09

Summary:

- Rebuilt the signed-in dashboard overview with Midday-style `components/widgets/*` files for metric widgets, action buttons, workload bars, follow-up health, channel mix, priority follow-ups, and recent jobs.
- Extended `dashboard.overview` with live aggregates for overdue, due today, upcoming, resolved, sent-this-week, status, channel, and recent job data through `packages/db/src/queries/dashboard-overview.ts`.
- Documented the feature in `brain/features/dashboard-overview.md`.

Verification:

- Recommended after the Midday file-architecture extraction: `bun run --filter @afterservice/dashboard typecheck` and `bun run --filter @afterservice/api typecheck`.

### Midday Layout And Job Sheet Alignment

Completed: 2026-06-09

Summary:

- Aligned the signed-in dashboard shell content padding with the Midday sidebar layout rhythm.
- Extended `ComboboxDropdown` with a `createPosition` option so create actions can appear as the first search result.
- Updated the job create sheet to use creatable autocomplete for customer, service title, and service category.
- Inline customer creation now creates the customer and selects it for the job.

Verification:

- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Template Sheets Shadcn Alignment

Completed: 2026-06-09

Summary:

- Converted create and edit template sheets from raw labels, selects, and checkboxes to shared shadcn-style form primitives.
- Reused the API `updateTemplateSchema` for edit validation instead of duplicating the schema locally.
- Added sheet descriptions and merge-tag helper text for standard sheet context.

Verification:

- `git diff --check -- apps/dashboard/src/components/sheets/template-create-sheet.tsx apps/dashboard/src/components/sheets/template-sheet.tsx`
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Billing And Settings Page Alignment

Completed: 2026-06-09

Summary:

- Rebuilt billing into a Midday-style page with plan summary cards, usage meters, subscription details, checkout action, and provider portal action.
- Updated settings to use a constrained settings page layout.
- Converted workspace settings form to shared form, select, and creatable combobox primitives.
- Documented workspace settings in `brain/features/workspace-settings.md`.

Verification:

- `git diff --check -- apps/dashboard/src/components/forms/update-workspace-form.tsx apps/dashboard/src/app/(sidebar)/settings/page.tsx apps/dashboard/src/components/billing-overview.tsx apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Dark Mode

Completed: 2026-06-09

Summary:

- Added `next-themes` class-based theme provider to the dashboard root.
- Added a Midday-style light/dark/system selector in the user menu.
- Documented dashboard dark mode in `brain/features/dashboard-dark-mode.md`.

Verification:

- `git diff --check -- apps/dashboard/package.json apps/dashboard/src/app/layout.tsx apps/dashboard/src/components/theme-provider.tsx apps/dashboard/src/components/theme-switch.tsx apps/dashboard/src/components/user-menu.tsx`
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Dark Mode Settings Surface

Completed: 2026-06-10

Summary:

- Added a Midday-style Appearance card to dashboard Settings.
- Reused the existing light/dark/system `ThemeSwitch` instead of adding a second theme control path.
- Updated the dashboard root shell classes so the themed background covers the document and body.
- Updated `brain/features/dashboard-dark-mode.md`.

Verification:

- `git diff --check -- apps/dashboard/src/app/layout.tsx apps/dashboard/src/app/(sidebar)/settings/page.tsx apps/dashboard/src/components/change-theme.tsx brain/features/dashboard-dark-mode.md brain/tasks/done.md`
- Targeted symbol scan confirmed the Settings page imports and renders `ChangeTheme`.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Table Empty States

Completed: 2026-06-09

Summary:

- Standardized customer, job, follow-up, and template table empty states around the shared table empty-state component.
- Fixed follow-up and template empty-state actions so they open their own create sheets instead of customer creation.
- Changed no-results actions to clear the matching table filter params instead of wiping unrelated sheet/detail state.
- Documented the table standardization state in `brain/features/dashboard-table-standardization.md`.

Verification:

- `git diff --check -- apps/dashboard/src/components/tables/customers/empty-states.tsx apps/dashboard/src/components/tables/jobs/empty-states.tsx apps/dashboard/src/components/tables/follow-ups/empty-states.tsx apps/dashboard/src/components/tables/templates/empty-states.tsx`
- Targeted search confirmed follow-up/template empty states no longer reference customer creation.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Sheet Standardization

Completed: 2026-06-09

Summary:

- Converted customer create/edit sheets to shared shadcn-style form primitives.
- Converted follow-up create, schedule, and work sheets away from native selects, raw labels, and direct field registration markup.
- Added shared select controls for follow-up channel, customer, related job, and template choices.
- Added the missing job create sheet description so primary create sheets share the same header rhythm.
- Documented the slice in `brain/features/dashboard-sheet-standardization.md`.

Verification:

- `git diff --check -- apps/dashboard/src/components/sheets/customer-create-sheet.tsx apps/dashboard/src/components/sheets/edit-customer-sheet.tsx apps/dashboard/src/components/sheets/follow-up-create-sheet.tsx apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx apps/dashboard/src/components/sheets/follow-up-card-sheet.tsx apps/dashboard/src/components/sheets/job-create-sheet.tsx`
- Targeted search found no native selects, raw `Label` usage, or direct `form.register` markup in `apps/dashboard/src/components/sheets`.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Filter Payload Alignment

Completed: 2026-06-09

Summary:

- Fixed customer, follow-up, and template table searches to send `search` to their routers instead of URL-only `q`.
- Normalized job table filter values before API calls so empty URL params do not send `null` into optional router fields.
- Removed unsupported sort payloads from customers, jobs, follow-ups, and templates table queries and page prefetches.
- Trimmed customer filter params to the currently supported search key.

Verification:

- `git diff --check -- apps/dashboard/src/hooks/use-customer-filter-params.ts apps/dashboard/src/components/tables/customers/data-table.tsx apps/dashboard/src/components/tables/follow-ups/data-table.tsx apps/dashboard/src/components/tables/templates/data-table.tsx apps/dashboard/src/components/tables/jobs/data-table.tsx apps/dashboard/src/app/(sidebar)/customers/page.tsx apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx apps/dashboard/src/app/(sidebar)/templates/page.tsx apps/dashboard/src/app/(sidebar)/jobs/page.tsx`
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Onboarding Form Standardization

Completed: 2026-06-09

Summary:

- Converted onboarding from raw labels, native select, and direct `form.register` markup to shared shadcn-style form primitives.
- Kept creatable business type and service category autocomplete behavior aligned with workspace settings.
- Replaced the default follow-up delay native select with the shared `Select` primitive.
- Documented the slice in `brain/features/dashboard-onboarding-standardization.md`.

Verification:

- `git diff --check -- apps/dashboard/src/components/forms/onboarding-form.tsx`
- Targeted search found no native selects, raw `Label` usage, raw `label` tags, or direct `form.register` markup in `apps/dashboard/src/components/forms` and `apps/dashboard/src/components/sheets`.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Page Shell Standardization

Completed: 2026-06-09

Summary:

- Switched customers, jobs, follow-ups, and templates pages from the internal Next.js error boundary import to the local dashboard `ErrorBoundary`.
- Kept the existing `ErrorFallback` behavior through the local boundary's `fallback` prop.
- Documented page-shell consistency in `brain/features/dashboard-page-standardization.md`.

Verification:

- `git diff --check -- apps/dashboard/src/app/(sidebar)/customers/page.tsx apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx apps/dashboard/src/app/(sidebar)/jobs/page.tsx apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- Targeted search confirmed no remaining `next/dist/client/components/error-boundary` imports in `apps/dashboard/src/app`.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Loading State Standardization

Completed: 2026-06-09

Summary:

- Added domain table skeleton wrappers for customers, jobs, follow-ups, and templates.
- Replaced table route text loading fallbacks with the new domain skeletons.
- Added a follow-up board skeleton and replaced the board text loading fallback.
- Fixed follow-up table sticky/non-reorderable config to use the real `customer` column ID.

Verification:

- `git diff --check -- apps/dashboard/src/components/tables/customers/skeleton.tsx apps/dashboard/src/components/tables/jobs/skeleton.tsx apps/dashboard/src/components/tables/follow-ups/skeleton.tsx apps/dashboard/src/components/tables/templates/skeleton.tsx apps/dashboard/src/components/boards/follow-ups-board.tsx apps/dashboard/src/utils/table-configs.ts apps/dashboard/src/app/(sidebar)/customers/page.tsx apps/dashboard/src/app/(sidebar)/jobs/page.tsx apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- Targeted search confirmed the table and follow-up board text loading fallbacks were replaced.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Table Sort Alignment

Completed: 2026-06-09

Summary:

- Added allowlisted sort inputs to customer, service job, follow-up, and template API list routers.
- Reconnected table URL sort state to server prefetches and client table queries.
- Fixed sort toggling so clicking a new column starts at ascending instead of inheriting the previous column's direction.
- Kept unsupported sort fields on safe router defaults.

Verification:

- `git diff --check -- apps/api/src/routers/_app.ts apps/dashboard/src/hooks/use-sort-query.ts apps/dashboard/src/components/tables/customers/data-table.tsx apps/dashboard/src/components/tables/jobs/data-table.tsx apps/dashboard/src/components/tables/follow-ups/data-table.tsx apps/dashboard/src/components/tables/templates/data-table.tsx apps/dashboard/src/app/(sidebar)/customers/page.tsx apps/dashboard/src/app/(sidebar)/jobs/page.tsx apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- Targeted search confirmed route prefetches and client table queries pass sort state to the routers.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Follow-Up Filter Options

Completed: 2026-06-09

Summary:

- Added channel and due-date range filters to the follow-up history table filter menu.
- Extended follow-up filter URL params, server prefetch, client table query, and API router predicates to match.
- Added typed normalizers so invalid URL channel/status values are not sent to the tRPC router.
- Preserved existing status and search filters, and made clearing the search input clear only `q`.

Verification:

- `git diff --check -- apps/api/src/routers/_app.ts apps/dashboard/src/hooks/use-follow-up-filter-params.ts apps/dashboard/src/components/follow-up-search-filter.tsx apps/dashboard/src/components/filter-list.tsx apps/dashboard/src/components/tables/follow-ups/data-table.tsx apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx`
- Targeted search confirmed channel/start/end filters flow through hook, UI, page prefetch, table query, and router predicates.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Table Header Responsiveness

Completed: 2026-06-09

Summary:

- Updated customer, job, follow-up, and template table headers to stack controls on small screens.
- Kept search/filter controls and column/action buttons aligned horizontally on wider screens.
- Documented the header behavior in `brain/features/dashboard-page-standardization.md`.

Verification:

- `git diff --check -- apps/dashboard/src/components/customers-header.tsx apps/dashboard/src/components/jobs-header.tsx apps/dashboard/src/components/follow-ups-header.tsx apps/dashboard/src/components/templates-header.tsx`
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Dashboard Sheet Loading States

Completed: 2026-06-09

Summary:

- Added a shared sheet form skeleton for record-loading states.
- Replaced raw centered `Loading...` placeholders in customer edit, template edit, schedule follow-up, and follow-up work sheets.
- Documented the loading-state standard in `brain/features/dashboard-sheet-standardization.md`.

Verification:

- `git diff --check -- apps/dashboard/src/components/sheets/sheet-form-skeleton.tsx apps/dashboard/src/components/sheets/edit-customer-sheet.tsx apps/dashboard/src/components/sheets/template-sheet.tsx apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx apps/dashboard/src/components/sheets/follow-up-card-sheet.tsx`
- Targeted search found no raw centered sheet `Loading...` placeholders.
- Recommended: `bun run --filter @afterservice/dashboard typecheck`.

### Onboarding Business Taxonomy Suggestions

Completed: 2026-06-09

Summary:

- Replaced onboarding business type and service category text inputs with creatable autocomplete dropdowns.
- Added 18 default business type suggestions and business-specific service category suggestions.
- Kept custom typed values supported for both fields, with a generic service category fallback for custom business types.

Verification:

- `bun run --filter @afterservice/dashboard typecheck`

### Fix Landing CTA Server Event Handler Error

Completed: 2026-06-03

Summary:

- Marked the landing bottom CTA component as a client component so its click tracking handler can run at the client boundary.
- Marked the shared events client entrypoint as a client module because it uses OpenPanel client hooks.
- Replaced the shared `track()` client helper with `useTrack()` so OpenPanel hooks run during component render instead of click handlers.

Files changed:

- `apps/website/src/components/landing/cta.tsx`
- `apps/website/src/components/landing/header.tsx`
- `apps/dashboard/src/components/forms/onboarding-form.tsx`
- `apps/dashboard/src/components/forms/update-workspace-form.tsx`
- `apps/dashboard/src/components/search-field.tsx`
- `apps/dashboard/src/components/user-menu.tsx`
- `packages/events/src/client.tsx`

### Remove IS_LAUNCHED Website Flag

Completed: 2026-06-03

Summary:

- Removed the website homepage `IS_LAUNCHED` gate.
- Updated the homepage to render the main launched landing page directly.
- Removed the unused prelaunch homepage component and waitlist form.
- Removed `isLaunched` from `@afterservice/utils` and dropped `IS_LAUNCHED` from `.env.example`.

Files changed:

- `apps/website/src/app/page.tsx`
- `apps/website/src/components/pre-launch.tsx`
- `packages/utils/src/env.ts`
- `.env.example`

### Project Brain Initialization

Completed: 2026-05-24

Summary:

- Initialized complete `brain/` documentation system.
- Documented product vision, system architecture, engineering rules, database/API plans, task tracking, templates, and roadmap phases.
- Added ADR for using the Plot Keys-style architecture.

### Phase 1: Repo Bootstrap

Completed: 2026-05-24

Summary:

- Created standalone afterservice Bun/Turbo monorepo.
- Added website, dashboard, and API apps.
- Added shared package skeletons.
- Added root env files and committed env example.
- Initialized Git on `main`.
- Verified install, typecheck, lint, build, and smoke checks.

Verification:

- `bun install`
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Website `GET /` returned 200.
- Dashboard `GET /` returned 200.
- API `GET /health` returned 200.

### Phase 2: Environment System

Completed: 2026-05-24

Summary:

- Added root `scripts/with-workspace-env.mjs` runner.
- Wired root dev/build commands and app dev/build/start commands through the env runner.
- Local commands load root `.env`; production build/start commands load root `.env.production`.
- Added shared app URL constants and environment validation helpers in `@afterservice/utils`.
- Expanded `.env.example` and documented env usage in `README.md`.

Verification:

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- `bun run dev:api`
- API `GET /health` returned shared site, dashboard, and API URLs.

Insight:

- The important architecture choice is to keep env ownership at the workspace root while exposing typed helpers from `@afterservice/utils`. That keeps future auth, billing, API, and frontend work from each inventing their own `process.env` contract.

Next Phase Breakdown:

- Phase 3 should create real route shells before adding deeper UI or data.
- Website needs `/`, `/pricing`, `/login`, and `/signup`.
- Dashboard needs auth-neutral placeholders for onboarding, customers, jobs, follow-ups, templates, billing, and settings.
- API needs the Hono structure expanded with a tRPC mount placeholder, auth placeholder routes, and Lemon Squeezy webhook placeholder.
- The goal is route coverage and stable app shape, not database-backed behavior yet.

### Phase 3: App Shells

Completed: 2026-05-24

Summary:

- Added website routes for `/`, `/pricing`, `/login`, and `/signup`.
- Added dashboard placeholders for `/`, `/sign-in`, `/sign-up`, `/onboarding`, `/customers`, `/jobs`, `/follow-ups`, `/templates`, `/billing`, and `/settings`.
- Added shared app metadata and website/dashboard navigation registries.
- Mounted the API tRPC handler under `/trpc/*`.
- Added placeholder routes for `/api/auth/*` and `/webhooks/lemon-squeezy`.
- Added a dashboard API type bridge to verify dashboard imports API router types.

Verification:

- `bun install`
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Website route smoke: `/`, `/pricing`, `/login`, `/signup` returned 200.
- Dashboard route smoke: `/`, `/sign-in`, `/sign-up`, `/onboarding`, `/customers`, `/jobs`, `/follow-ups`, `/templates`, `/billing`, `/settings` returned 200.
- API smoke: `/health`, `/trpc/health`, `/api/auth/session`, and `/webhooks/lemon-squeezy` returned placeholder responses.

Insight:

- Phase 3 gives the product a navigable skeleton without pretending auth, billing, or data exists yet. That makes the next UI and database work easier because routes and ownership boundaries are already named.

Next Phase Breakdown:

- Phase 4 should replace the raw shells with a practical operator-focused design system.
- `@afterservice/ui` needs typed primitives such as Button, Input, Textarea, Select, Dialog, Dropdown, Tabs, Badge, Table, and EmptyState.
- The dashboard needs a real sidebar/topbar foundation with workspace and billing placeholders.
- Website and dashboard navigation should use the shared route registries instead of one-off links.
- The design target is dense, scannable SaaS UI for repeated operator workflows.

### Phase 4: Design System And Navigation

Completed: 2026-05-24

Summary:

- Added typed `@afterservice/ui` primitives: Button, Input, Textarea, Select, Dialog, Dropdown, Tabs, Badge, Table, and EmptyState.
- Added shared UI class contracts and responsive app-level CSS.
- Upgraded the dashboard layout into a sidebar/topbar shell with workspace status and route navigation.
- Upgraded website layout with shared navigation, footer, and responsive page styles.
- Extended shared navigation registries for website and dashboard routes.

Verification:

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Production build confirmed all website and dashboard app routes still prerender.

Insight:

- The UI package now owns component APIs while each app owns its visual context. That keeps Phase 5 and Phase 6 from coupling database/auth work to ad hoc markup decisions.

Next Phase Breakdown:

- Phase 5 should introduce Prisma in `packages/db` and make database ownership explicit.
- Add the Postgres datasource, generated client export, and initial schema for users, sessions, workspaces, memberships, customers, jobs, follow-ups, templates, events, messages, subscriptions, and billing events.
- Every business model should be workspace-scoped from the first migration.
- Add seed helpers for default follow-up templates, but keep outbound messaging disabled.
- Verification depends on a reachable local Postgres database for migration application.

### Phase 5: Database Foundation

Completed: 2026-05-24

Summary:

- Added Prisma 7 tooling to `@afterservice/db`.
- Added `prisma.config.ts` with root `DATABASE_URL` support through the workspace env runner.
- Added Postgres schema covering auth, workspaces, memberships, team invites, customers, service jobs, follow-ups, templates, follow-up events, message logs, subscriptions, and billing events.
- Added initial migration SQL under `packages/db/prisma/migrations`.
- Added generated Prisma Client exports and a `createDbClient` helper using the Prisma Postgres adapter.
- Added starter follow-up template seed helpers.
- Added an afterservice-specific Docker Postgres service on port `55433`.

Verification:

- `bun --cwd packages/db prisma -v`
- `bun run db:validate`
- `bun run db:generate`
- `bun run db:migrate` against Docker Postgres at `localhost:55433`
- `bun run typecheck`
- `bun run lint`
- `bun run build`

Insight:

- The database now encodes the core product boundary: workspace-scoped operational data, auth/account tables, and billing state are separate but connected. That gives Phase 6 a real place to create users, workspaces, memberships, and starter templates.

Next Phase Breakdown:

- Phase 6 should implement auth/session plumbing without yet building the full customer/job workflows.
- Sign-up and sign-in pages should stop being placeholders and connect to `@afterservice/auth`.
- Onboarding should create the workspace, owner membership, starter plan state, and default templates in one transaction.
- API context should resolve user, active workspace, and membership role.
- Authenticated API routes should reject anonymous requests, and workspace routes should reject users without membership.

### Phase 6: Authentication And Workspace Onboarding

Completed: 2026-05-24

Summary:

- Added Better Auth email/password authentication in `@afterservice/auth` with Prisma-backed persistence.
- Updated auth database tables for Better Auth-compatible user, session, and account fields.
- Mounted Better Auth under `/api/auth/*` in the Hono API with credentialed CORS.
- Added sign-up and sign-in dashboard forms that call the API auth endpoints.
- Added session-aware API context with user, workspace, and membership resolution.
- Added authenticated onboarding that creates a workspace, owner membership, and default follow-up templates in one transaction.
- Added Better Auth env examples and trusted-origin support for local and production app URLs.

Verification:

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- `GET /health` returned 200 from the local API smoke server.
- `GET /trpc/health` returned 200 from the local API smoke server.
- `POST /api/auth/sign-up/email` returned 200 and set a Better Auth session cookie.
- `POST /api/onboarding` returned 200 and created workspace `phase-six-repair-f9b7a6`.
- Repeating `POST /api/onboarding` with the same session returned the same workspace.

Insight:

- Auth is now a product boundary rather than a placeholder: user identity, session cookies, workspace ownership, and starter operational data all enter the system through one verified path. That gives the next data features a trustworthy workspace scope to build on.

Next Phase Breakdown:

- Phase 7 should turn the customers placeholder into the first real workspace CRUD surface.
- Add customer router procedures for list, create, update, detail, archive, and search.
- Enforce workspace scoping through the API context before exposing any customer records.
- Build customer list, empty state, create/edit form, and detail view in the dashboard.
- Keep the UI dense and operator-focused because customers will become the anchor for jobs and follow-ups in later phases.

### Terminal Script Feature

Completed: 2026-05-24

Summary:

- Added `scripts/terminal.mjs` as a discoverable terminal helper for common project commands.
- Added the root `bun run terminal` package script.
- Documented usage in `README.md`.
- Included scripts for dev servers, checks, build, lint, typecheck, and Prisma helpers.

Verification:

- `bun run terminal`
- `bun run terminal db:validate`
- `bun run typecheck`
- `bun run lint`

Insight:

- The repo now has one low-friction command surface for recurring terminal work. That should make future phases easier to run and verify without remembering every package-level script.

Next Phase Breakdown:

- Phase 7 remains the product priority.
- Customer management should be built against the existing auth/workspace context.
- Keep using `bun run terminal check` as the broad pre-commit gate once Phase 7 touches API and dashboard behavior.

### Logo And Favicon Integration

Completed: 2026-05-25

Summary:

- Added the selected abstract `a` logo direction as a shared `@afterservice/ui` brand component.
- Added matching `icon.svg` favicon files for the website and dashboard apps.
- Updated website and dashboard shell branding to use the new logo mark and wordmark.

Verification:

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Website `GET /` rendered the logo markup.
- Dashboard `GET /` rendered the logo markup.
- Website and dashboard `GET /icon.svg` returned SVG favicons.

Insight:

- The brand now has a reusable vector source in code rather than a cropped generated image. That gives us a cleaner base for future polish, social images, and app icons.

Next Phase Breakdown:

- If the mark still feels right after seeing it in context, the next brand step is exporting production asset sizes and adding Open Graph images.
- Product work can continue with Phase 7 customer management using this mark as the app shell identity.

### Marketing Home Page Header Redesign

Completed: 2026-05-30

Summary:

- Redesigned the marketing homepage header in `launched.tsx` and `pre-launch.tsx` to use the shared `BrandLogo` component from `@afterservice/ui`.
- Added `@afterservice/ui` CSS class contracts (`as-button`, `as-badge`) with dark-mode support to the website's `globals.css`.
- Replaced inline SVG logos with `BrandLogo` in both landing page headers and footers.
- Used `Button` component for "Start Free Trial" CTA and `Badge` for "PRE-LAUNCH" status indicator.
- Added responsive mobile hamburger menu with nav links and CTAs to `launched.tsx`.
- Preserved existing Tailwind styling, dark/light theme toggle, and sticky backdrop-blur header design.

Verification:

- `bun x tsc --noEmit` passed for website app.
- `bun x biome check` passed for changed files.

Files changed:

- `apps/website/src/app/globals.css`
- `apps/website/src/components/launched.tsx`
- `apps/website/src/components/pre-launch.tsx`

### MVP Implementation And Auth Loop Fix

Completed: 2026-05-30

Summary:

- Implemented workspace, customer, service job, follow-up, template, and billing tRPC routers.
- Replaced dashboard placeholders with functional operator workflows.
- Added Lemon Squeezy signed webhook handling and idempotent billing event storage.
- Added Starter/Growth/Pro limits and API-level entitlement enforcement.
- Added manual-send `MessageLog` creation and `FollowUpEvent` timelines.
- Added jobs package primitives for due follow-up discovery and missed/overdue dry runs.
- Added `bun run smoke:mvp` for local MVP journey, permission, entitlement, and Lemon webhook smoke coverage.
- Fixed dashboard sign-in redirect loops caused by secure-prefixed Better Auth cookies.
- Added the cron-protected follow-up job endpoint and smoke coverage.
- Added website feature, customer, privacy, and terms pages.
- Added dashboard catch-all redirect route required by the Brain architecture rules.
- Added MVP observability notes.
- Browser-smoked the website feature/customer/legal routes and the dashboard sign-up/onboarding/home flow.
- Updated Brain feature docs, API contracts, roadmap status, and MVP handoff.

Verification:

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- `bun run smoke:mvp`
- `bunx prisma validate` from `packages/db`
- `bun run db:generate` from `packages/db`
- Local auth smoke: sign-up, onboarding, and authenticated dashboard home returned `200`.

Files changed:

- `apps/api`
- `apps/dashboard`
- `packages/auth`
- `packages/jobs`
- `packages/notifications`
- `packages/ui`
- `brain`

### Landing And Pricing Alignment To Free Beta

Completed: 2026-06-04

Summary:

- Updated the public website from paid free-trial launch copy to Free Beta / early access copy.
- Replaced overpromising automation, private-dispute, review-gating, and unsupported metric claims with manual-first post-job follow-up positioning.
- Added public plan data for Free Beta, Starter, Shop, and Growth.
- Updated `/pricing` to use the same pricing surface as the landing page.
- Updated dashboard billing copy to show Free Beta and disable paid checkout unless `AFTERSERVICE_PAID_CHECKOUT_ENABLED=true`.
- Updated API plan limits and public plan labels so internal `growth` maps to public Shop and internal `pro` maps to public Growth.
- Added beta-safe analytics events for joining free beta, viewing pricing, and planned paid-plan interest.

Verification:

- Focused Biome check passed for changed app, API, events, notifications, and script files.
- `bun run typecheck` passed.
- `bun run build` passed.
- Stale-copy scan across `apps/website`, `apps/dashboard`, `apps/api`, and `packages` returned no old trial/review-funnel language.
- HTTP smoke checks confirmed `/` and `/pricing` serve the Free Beta and planned paid plan copy locally.
- Full monorepo `bun run lint` still fails on existing `@afterservice/ui` animation/accessibility diagnostics outside this scope.

Files changed:

- `apps/website`
- `apps/dashboard`
- `apps/api`
- `packages/events`
- `.env.example`
- `brain`

### Midday-Style Dashboard Auth Guard

Completed: 2026-06-04

Summary:

- Replaced the placeholder client `AuthGuard` with real server-side session and workspace membership checks in the dashboard `(sidebar)` layout.
- Redirects unauthenticated users to `/sign-in`.
- Redirects authenticated users without a workspace membership to `/onboarding`.
- Renders the current workspace name in the dashboard header from the server-rendered layout.
- Kept API `protectedProcedure` as the data-access source of truth.
- Fixed manual follow-up send logging so `markSent` awaits notification/message-log persistence and returns the refreshed follow-up.
- Preserved follow-up/customer IDs in email message-log payloads.
- Synced the local database schema with Prisma before rerunning smoke.

Verification:

- Focused Biome check passed for changed auth/layout/API/notification files.
- `bun run typecheck` passed.
- `bun run smoke:mvp` passed.

Files changed:

- `apps/dashboard/src/app/(sidebar)/layout.tsx`
- `apps/dashboard/src/components/auth-guard.tsx`
- `apps/api/src/routers/_app.ts`
- `packages/notifications/src/types/followup-message-sent.ts`
- `brain`

### Dashboard Template Channel Filter

Completed: 2026-06-09

Summary:

- Added a Midday-style search/filter control for the templates page.
- Added URL-backed template channel filter state.
- Wired template channel filtering through route prefetch, the templates table query, and the API router predicate.
- Updated the Brain dashboard table and templates feature docs.

Verification:

- Focused whitespace and targeted filter wiring checks only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/templates-search-filter.tsx`
- `apps/dashboard/src/components/templates-header.tsx`
- `apps/dashboard/src/hooks/use-template-filter-params.ts`
- `apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- `apps/dashboard/src/components/tables/templates/data-table.tsx`
- `apps/api/src/routers/_app.ts`
- `brain`

### Dashboard Billing And Settings Loading States

Completed: 2026-06-09

Summary:

- Replaced the billing page fallback and client loading text with a structured billing skeleton.
- Replaced the workspace settings form loading text with a field-shaped skeleton.
- Updated Brain billing and workspace settings docs.

Verification:

- Focused whitespace and loading-placeholder scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- `apps/dashboard/src/components/billing-overview.tsx`
- `apps/dashboard/src/components/forms/update-workspace-form.tsx`
- `brain`

### Dashboard Customer Search Predicate

Completed: 2026-06-09

Summary:

- Expanded customer table search to match name, company, email, phone, and exact tag values.
- Updated Brain dashboard table standardization notes.

Verification:

- Focused whitespace and exact predicate scan only, per fast Bun monorepo command discipline.

Files changed:

- `apps/api/src/routers/_app.ts`
- `brain`

### Dashboard Page Skeleton Fallbacks

Completed: 2026-06-09

Summary:

- Replaced the dashboard overview route's raw suspense placeholder with the existing `OverviewSkeleton`.
- Added `OnboardingFormSkeleton` and wired the onboarding route suspense fallback to it.
- Removed redundant loading prose from the schedule follow-up sheet description.
- Updated Brain page and onboarding standardization docs.

Verification:

- Focused whitespace and stale raw fallback scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/page.tsx`
- `apps/dashboard/src/app/onboarding/page.tsx`
- `apps/dashboard/src/components/forms/onboarding-form.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `brain`

### Follow-Up Board Sheet URL Alignment

Completed: 2026-06-10

Summary:

- Updated follow-up board cards to open the work sheet with the standardized `followUpId` URL param.
- Kept board rendering and card copy unchanged.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact follow-up URL-param scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/boards/follow-ups-board.tsx`
- `brain`

### Dashboard Table Date Label Sentence Case

Completed: 2026-06-10

Summary:

- Normalized customer, job, follow-up, and template date column labels to sentence case.
- Kept column IDs and sort/filter behavior unchanged.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact date-label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/customers/columns.tsx`
- `apps/dashboard/src/components/tables/customers/table-header.tsx`
- `apps/dashboard/src/components/tables/jobs/columns.tsx`
- `apps/dashboard/src/components/tables/jobs/table-header.tsx`
- `apps/dashboard/src/components/tables/follow-ups/columns.tsx`
- `apps/dashboard/src/components/tables/follow-ups/table-header.tsx`
- `apps/dashboard/src/components/tables/templates/columns.tsx`
- `apps/dashboard/src/components/tables/templates/table-header.tsx`
- `brain`

### Dashboard Table Row Open Handler Cleanup

Completed: 2026-06-10

Summary:

- Removed stale `details: true` comments from customer, job, and template table row-open handlers.
- Preserved the existing URL-backed detail sheet behavior.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact stale details-comment scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/customers/data-table.tsx`
- `apps/dashboard/src/components/tables/jobs/data-table.tsx`
- `apps/dashboard/src/components/tables/templates/data-table.tsx`
- `brain`

### Dashboard Auth Page Shell Standardization

Completed: 2026-06-09

Summary:

- Added a shared centered auth shell for public dashboard auth routes.
- Replaced duplicated split-panel auth layouts on sign-in, sign-up, forgot-password, and reset-password.
- Removed decorative gradient/noise auth panels in favor of a quieter Midday-style focused auth surface.
- Updated Brain page standardization docs.

Verification:

- Focused whitespace and stale split-panel/decorative-class scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/auth/auth-shell.tsx`
- `apps/dashboard/src/app/sign-in/page.tsx`
- `apps/dashboard/src/app/sign-up/page.tsx`
- `apps/dashboard/src/app/forgot-password/page.tsx`
- `apps/dashboard/src/app/reset-password/page.tsx`
- `brain`

### Dashboard Customer Tag Filters

Completed: 2026-06-09

Summary:

- Added a Midday-style search/filter control to the customers page.
- Added URL-backed customer tag filters and reusable tag filter chips.
- Wired customer tag filters through route prefetch, the customers table query, and the API router predicate.
- Updated Brain dashboard table standardization notes.

Verification:

- Focused whitespace and exact customer tag filter wiring scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/customers-search-filter.tsx`
- `apps/dashboard/src/components/customers-header.tsx`
- `apps/dashboard/src/hooks/use-customer-filter-params.ts`
- `apps/dashboard/src/app/(sidebar)/customers/page.tsx`
- `apps/dashboard/src/components/tables/customers/data-table.tsx`
- `apps/dashboard/src/components/filter-list.tsx`
- `apps/api/src/routers/_app.ts`
- `brain`

### Dashboard Table Settings Hydration

Completed: 2026-06-09

Summary:

- Added a server-only table settings cookie reader.
- Wired customers, jobs, follow-ups, and templates route pages to pass persisted table settings into their table components.
- Kept table setting persistence owned by the existing table settings hook and server action.
- Updated Brain dashboard table standardization notes.

Verification:

- Focused whitespace and exact table settings wiring scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/utils/table-settings-server.ts`
- `apps/dashboard/src/app/(sidebar)/customers/page.tsx`
- `apps/dashboard/src/app/(sidebar)/jobs/page.tsx`
- `apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx`
- `apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- `brain`

### Dashboard Infinite Table Prefetch Alignment

Completed: 2026-06-09

Summary:

- Switched customers, jobs, follow-up history, and templates route prefetches from ordinary query options to infinite query options.
- Matched route prefetch keys to the table components that consume `useSuspenseInfiniteQuery`.
- Left the follow-up board prefetch as a normal query because the board uses non-infinite data.
- Updated Brain dashboard table standardization notes.

Verification:

- Focused whitespace and exact route prefetch scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/customers/page.tsx`
- `apps/dashboard/src/app/(sidebar)/jobs/page.tsx`
- `apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx`
- `apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- `brain`

### Dashboard Auth Form Standardization

Completed: 2026-06-09

Summary:

- Converted sign-in, sign-up, forgot-password, and reset-password forms to local Zod schemas with `useZodForm`.
- Replaced raw auth form labels and manual field state with shared shadcn-style form primitives.
- Preserved the sign-in/sign-up dev quick-fill adapter behavior using the form API.
- Kept existing Better Auth endpoint behavior and success/error states.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and stale raw-control scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/auth/sign-in-form.tsx`
- `apps/dashboard/src/components/auth/sign-up-form.tsx`
- `apps/dashboard/src/components/auth/forgot-password-form.tsx`
- `apps/dashboard/src/components/auth/reset-password-form.tsx`
- `brain`

### Dashboard Page Error Fallback Alignment

Completed: 2026-06-09

Summary:

- Added the shared `ErrorFallback` to dashboard overview, billing, settings, and onboarding page error boundaries.
- Aligned non-table dashboard pages with the table pages' retry fallback pattern.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and error-boundary fallback scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/page.tsx`
- `apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `apps/dashboard/src/app/onboarding/page.tsx`
- `brain`

### Dashboard Job Category Filters

Completed: 2026-06-09

Summary:

- Added URL-backed service category filters for the jobs page.
- Wired category filters through route prefetch, the jobs table query, and the service jobs API predicate.
- Added category filter chips and a category submenu to the jobs filter control.
- Updated Brain dashboard table standardization notes.

Verification:

- Focused whitespace and exact job category filter wiring scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-job-filter-params.ts`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `apps/dashboard/src/components/filter-list.tsx`
- `apps/dashboard/src/app/(sidebar)/jobs/page.tsx`
- `apps/dashboard/src/components/tables/jobs/data-table.tsx`
- `apps/api/src/routers/_app.ts`
- `brain`

### Dashboard Non-Table Route Prefetch Alignment

Completed: 2026-06-10

Summary:

- Added route-level tRPC prefetch and hydration to dashboard overview, billing, and settings pages.
- Removed stale prefetch TODO comments from those pages.
- Matched route prefetches to the client queries consumed by overview widgets, billing overview, and workspace settings form.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact prefetch/hydration scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/page.tsx`
- `apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `brain`

### Dashboard Stale Loading Text Cleanup

Completed: 2026-06-10

Summary:

- Removed the stale onboarding route prefetch TODO.
- Replaced create-sheet dropdown loading prose with stable field placeholders while disabled loading states remain in place.
- Updated Brain page and sheet standardization notes.

Verification:

- Focused whitespace and stale TODO/loading-text scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/onboarding/page.tsx`
- `apps/dashboard/src/components/sheets/follow-up-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/job-create-sheet.tsx`
- `brain`

### Dashboard Auth Route Thin Pages

Completed: 2026-06-10

Summary:

- Moved sign-in and sign-up client behavior into dedicated auth view components.
- Converted `/sign-in` and `/sign-up` route files into thin server pages with route metadata.
- Preserved dev quick-fill controls and auth submission behavior.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and route/client-boundary scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/sign-in/page.tsx`
- `apps/dashboard/src/app/sign-up/page.tsx`
- `apps/dashboard/src/components/auth/sign-in-view.tsx`
- `apps/dashboard/src/components/auth/sign-up-view.tsx`
- `brain`

### Dashboard Follow-Up Create Customer Autocomplete

Completed: 2026-06-10

Summary:

- Replaced the follow-up create sheet customer select with the shared combobox autocomplete.
- Added create-first customer creation so the first result can create the typed customer and select it.
- Updated the submit disabled state to key off the selected customer field rather than requiring preloaded customer options.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact combobox wiring scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/follow-up-create-sheet.tsx`
- `brain`

### Dashboard Jobs Filter Option Empty State

Completed: 2026-06-10

Summary:

- Added a compact empty-state row to the jobs customer filter submenu when no customers exist.
- Matched the category and customer-tag filter menu behavior so filter-option menus do not render blank.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact jobs filter empty-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `brain`

### Dashboard Follow-Up Board Empty State

Completed: 2026-06-10

Summary:

- Added a board-level empty state for the follow-up board when every column is empty.
- Wired the empty-state action to open the create follow-up sheet.
- Removed an unused card recipient variable while touching the board component.
- Updated Brain follow-up board and dashboard table standardization notes.

Verification:

- Focused whitespace and exact board empty-state/action scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/boards/follow-ups-board.tsx`
- `brain`

### Dashboard Follow-Up Board Typed Items

Completed: 2026-06-10

Summary:

- Replaced the follow-up board card `any` type with the inferred `followUps.listBoard` router output type.
- Changed per-column empty copy from generic card language to follow-up-specific language.
- Tidied JSX whitespace in the board card links and column title.
- Updated Brain follow-up board and dashboard table standardization notes.

Verification:

- Focused whitespace and exact board type/empty-copy scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/boards/follow-ups-board.tsx`
- `brain`

### Dashboard Non-Table Static Metadata

Completed: 2026-06-10

Summary:

- Converted dashboard overview, billing, and settings pages from async `generateMetadata` functions to static `metadata` exports.
- Aligned those non-table server routes with the existing customers, jobs, follow-ups, and templates route metadata pattern.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact metadata export scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/page.tsx`
- `apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `brain`

### Dashboard Table Router Output Typing

Completed: 2026-06-10

Summary:

- Typed customers, jobs, follow-up history, and templates table pagination from inferred tRPC router outputs.
- Removed `any` from table `getNextPageParam` and page-flattening code.
- Replaced the virtualizer-only fallback copy from misleading `No results.` to `Preparing rows...`; real empty and no-results states still use the shared domain empty-state components.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact table typing/fallback scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/customers/data-table.tsx`
- `apps/dashboard/src/components/tables/jobs/data-table.tsx`
- `apps/dashboard/src/components/tables/follow-ups/data-table.tsx`
- `apps/dashboard/src/components/tables/templates/data-table.tsx`
- `brain`

### Dashboard Table And Sheet Copy-Paste Cleanup

Completed: 2026-06-10

Summary:

- Fixed jobs and templates table drag-and-drop context IDs so they no longer reuse the customers table id.
- Standardized remaining follow-up/customer sheet titles to sentence case.
- Updated Brain table and sheet standardization notes.

Verification:

- Focused whitespace and exact DnD id/title scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/jobs/data-table.tsx`
- `apps/dashboard/src/components/tables/templates/data-table.tsx`
- `apps/dashboard/src/components/sheets/edit-customer-sheet.tsx`
- `apps/dashboard/src/components/sheets/follow-up-card-sheet.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `brain`

### Dashboard Column Visibility Label Primitives

Completed: 2026-06-10

Summary:

- Replaced raw checkbox labels in customer, job, follow-up, and template column visibility popovers with the shared `@afterservice/ui/label` primitive.
- Preserved the existing checkbox `htmlFor` associations and visibility behavior.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact raw-label/shared-label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/customers-column-visibility.tsx`
- `apps/dashboard/src/components/jobs-column-visibility.tsx`
- `apps/dashboard/src/components/follow-ups-column-visibility.tsx`
- `apps/dashboard/src/components/templates-column-visibility.tsx`
- `brain`

### Dashboard Shell Search Typing

Completed: 2026-06-10

Summary:

- Replaced the dashboard search item payload `any` with a small typed result data shape.
- Removed stale unused search imports while keeping the current stubbed search behavior.
- Typed the main navigation icon map without `ComponentType<any>`.
- Cleaned stale search/table comments that mentioned removed implementation details.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact dashboard-local `any` scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/search/search.tsx`
- `apps/dashboard/src/components/main-menu.tsx`
- `apps/dashboard/src/components/tables/core/virtual-row.tsx`
- `brain`

### Dashboard Search Route Shortcuts

Completed: 2026-06-10

Summary:

- Replaced stale `/sales-book/*` search shortcuts with actions derived from shared `dashboardNavItems`.
- Expanded search page-jump shortcuts to cover all primary dashboard nav pages.
- Updated the search placeholder to match the current page-jump behavior while global record search remains stubbed.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact stale-route/shared-nav scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/search/search.tsx`
- `brain`

### Dashboard Sheet Action Consistency

Completed: 2026-06-10

Summary:

- Changed the edit customer archive action copy to sentence case.
- Matched the job create sheet customer combobox pending disabled state to the follow-up create sheet.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact sheet action/disabled-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/edit-customer-sheet.tsx`
- `apps/dashboard/src/components/sheets/job-create-sheet.tsx`
- `brain`

### Dashboard Search And Follow-Up Copy Alignment

Completed: 2026-06-10

Summary:

- Updated the dashboard search trigger copy to match the current page-jump behavior.
- Removed stale placeholder navigation mapping from the stubbed search result path.
- Hyphenated follow-up copy in the schedule follow-up sheet description.
- Updated Brain page and sheet standardization notes.

Verification:

- Focused whitespace and exact search/follow-up copy scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/search/open-search-button.tsx`
- `apps/dashboard/src/components/search/search.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `brain`

### Template Create Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved the create-template form from the sheet into `components/forms/template-create-form.tsx`, matching the Midday sheet composition pattern.
- Kept the template create sheet focused on URL-backed open state and sheet layout.
- Normalized the template delete action copy to sentence case.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact template form/sheet scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/template-create-form.tsx`
- `apps/dashboard/src/components/sheets/template-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/template-sheet.tsx`
- `brain`

### Template Edit Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved template update and archive form behavior into `components/forms/template-edit-form.tsx`.
- Kept the template edit sheet focused on URL-backed open state, record fetching, and skeleton display.
- Fixed the template edit sheet to read the same `templateId` URL param written by the templates table.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace, URL-param, and exact template sheet ownership scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/template-edit-form.tsx`
- `apps/dashboard/src/components/sheets/template-sheet.tsx`
- `brain`

### Customer Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved customer create, update, and archive form behavior into dedicated files under `components/forms`.
- Kept customer create/edit sheets focused on URL-backed open state, sheet layout, record fetching, and skeleton display.
- Fixed the customer edit sheet to read the same `customerId` URL param written by the customers table.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace, URL-param, and exact customer sheet ownership scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/customer-create-form.tsx`
- `apps/dashboard/src/components/forms/customer-edit-form.tsx`
- `apps/dashboard/src/components/sheets/customer-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/edit-customer-sheet.tsx`
- `brain`

### Job Create Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved completed-job creation behavior into `components/forms/job-create-form.tsx`.
- Kept the job create sheet focused on URL-backed open state and sheet layout.
- Preserved create-first autocomplete for customer, service title, and service category.
- Updated Brain sheet and service job notes.

Verification:

- Focused whitespace and exact job autocomplete/sheet ownership scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/job-create-form.tsx`
- `apps/dashboard/src/components/sheets/job-create-sheet.tsx`
- `brain`

### Follow-Up Create Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved follow-up creation behavior into `components/forms/follow-up-create-form.tsx`.
- Kept the follow-up create sheet focused on URL-backed open state and sheet layout.
- Preserved create-first customer autocomplete behavior.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact follow-up autocomplete/sheet ownership scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/follow-up-create-form.tsx`
- `apps/dashboard/src/components/sheets/follow-up-create-sheet.tsx`
- `brain`

### Schedule Follow-Up Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved schedule follow-up validation and mutation behavior into `components/forms/schedule-follow-up-form.tsx`.
- Kept the schedule follow-up sheet focused on URL-backed open state, job/template fetching, and skeleton display.
- Preserved the existing `schedule_follow_up` query key.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact schedule follow-up sheet ownership scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/schedule-follow-up-form.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `brain`

### Follow-Up Work Sheet Form Extraction

Completed: 2026-06-10

Summary:

- Moved follow-up work actions into `components/forms/follow-up-work-form.tsx`.
- Kept the follow-up work sheet focused on URL-backed open state, record fetching, and skeleton display.
- Fixed the follow-up work sheet and priority widget link to use the same `followUpId` URL param written by the follow-ups table.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace, URL-param, and exact follow-up work sheet ownership scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/follow-up-work-form.tsx`
- `apps/dashboard/src/components/sheets/follow-up-card-sheet.tsx`
- `apps/dashboard/src/components/widgets/priority-follow-ups.tsx`
- `brain`

### Dashboard Overview And Billing Missing Data States

Completed: 2026-06-10

Summary:

- Replaced blank missing-data branches in the dashboard overview and billing client views with structured empty states.
- Added retry actions that refresh the current route.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact missing-data return scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/index.tsx`
- `apps/dashboard/src/components/billing-overview.tsx`
- `brain`

### Dashboard Filter Option Query Limit Alignment

Completed: 2026-06-10

Summary:

- Updated customer tag, job customer, and job category filter option queries to request the max supported list page size.
- Matched create/schedule form dropdown source queries for customers, jobs, and templates to the same limit.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact option-query limit scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/customers-search-filter.tsx`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `apps/dashboard/src/components/forms/follow-up-create-form.tsx`
- `apps/dashboard/src/components/forms/job-create-form.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `brain`

### Dashboard Filter Active-State Alignment

Completed: 2026-06-10

Summary:

- Updated customer, job, follow-up, and template filter bars so the filter button active state is based on visible, valid filter chips.
- Preserved URL params, filter chip rendering, and API query behavior.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact active-filter scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/customers-search-filter.tsx`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `apps/dashboard/src/components/follow-up-search-filter.tsx`
- `apps/dashboard/src/components/templates-search-filter.tsx`
- `brain`

### Dashboard Non-Table Page Scroll Wrapper Alignment

Completed: 2026-06-10

Summary:

- Wrapped the dashboard overview, billing, and settings routes in the shared `ScrollableContent` page wrapper.
- Kept the existing main layout padding owned by the sidebar layout.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact `ScrollableContent` route scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/page.tsx`
- `apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `brain`

### Dashboard Jobs Status Filter Contract Alignment

Completed: 2026-06-10

Summary:

- Added a shared service-job status helper for jobs filter URL state.
- Sanitized jobs status filters before route prefetch and client table queries.
- Tightened the service jobs API list input from plain string to the service job status enum.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact jobs status-filter scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-job-filter-params.ts`
- `apps/dashboard/src/app/(sidebar)/jobs/page.tsx`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `apps/dashboard/src/components/tables/jobs/data-table.tsx`
- `apps/api/src/routers/_app.ts`
- `brain`

### Dashboard Sheet Content Scroll Alignment

Completed: 2026-06-10

Summary:

- Added scrollable `SheetContent` to customer, job, follow-up, schedule, and template form sheets.
- Preserved sheet headers, URL-backed open state, and form components.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact `SheetContent` scroll-class scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/customer-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/edit-customer-sheet.tsx`
- `apps/dashboard/src/components/sheets/job-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/follow-up-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `apps/dashboard/src/components/sheets/template-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/template-sheet.tsx`
- `brain`

### Dashboard Metadata Brand Alignment

Completed: 2026-06-10

Summary:

- Updated dashboard route metadata titles to use the canonical `afterservice` product name.
- Kept existing metadata descriptions and route structure unchanged.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact dashboard metadata brand scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/sign-in/page.tsx`
- `apps/dashboard/src/app/sign-up/page.tsx`
- `apps/dashboard/src/app/onboarding/page.tsx`
- `apps/dashboard/src/app/(sidebar)/page.tsx`
- `apps/dashboard/src/app/(sidebar)/customers/page.tsx`
- `apps/dashboard/src/app/(sidebar)/jobs/page.tsx`
- `apps/dashboard/src/app/(sidebar)/follow-ups/page.tsx`
- `apps/dashboard/src/app/(sidebar)/templates/page.tsx`
- `apps/dashboard/src/app/(sidebar)/billing/page.tsx`
- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `brain`

### Dashboard Auth Recovery Metadata Alignment

Completed: 2026-06-10

Summary:

- Updated forgot-password and reset-password route metadata to use the canonical `afterservice` product name.
- Expanded their descriptions to match the dashboard account context.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact auth recovery metadata scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/forgot-password/page.tsx`
- `apps/dashboard/src/app/reset-password/page.tsx`
- `brain`

### Dashboard Jobs Schedule Sheet Wiring

Completed: 2026-06-10

Summary:

- Wired jobs table row clicks and the jobs action menu to the mounted schedule follow-up sheet.
- Removed unused `jobId` and `editJob` URL params from the jobs sheet params hook.
- Replaced the jobs action menu no-op delete item with a working schedule follow-up action.
- Updated Brain table and sheet standardization notes.

Verification:

- Focused whitespace and exact jobs schedule-sheet URL wiring scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/jobs/data-table.tsx`
- `apps/dashboard/src/components/tables/jobs/columns.tsx`
- `apps/dashboard/src/components/tables/core/types.ts`
- `apps/dashboard/src/hooks/use-job-params.ts`
- `brain`

### Dashboard Table Action Menu Wiring

Completed: 2026-06-10

Summary:

- Wired the templates table delete action to the existing `deleteTemplate` table meta callback.
- Removed stale customer action-menu comments while preserving the existing archive behavior.
- Renamed follow-up close table meta wiring from delete-oriented names to close-oriented names.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact table action-menu wiring scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/templates/columns.tsx`
- `apps/dashboard/src/components/tables/templates/data-table.tsx`
- `apps/dashboard/src/components/tables/customers/columns.tsx`
- `apps/dashboard/src/components/tables/customers/data-table.tsx`
- `apps/dashboard/src/components/tables/follow-ups/columns.tsx`
- `apps/dashboard/src/components/tables/follow-ups/data-table.tsx`
- `apps/dashboard/src/components/tables/core/types.ts`
- `brain`

### Dashboard Archive Action Copy Alignment

Completed: 2026-06-10

Summary:

- Renamed customer and template table archive callbacks from delete-oriented names to archive-oriented names.
- Updated customer and template table action labels to say archive instead of delete.
- Updated the template edit sheet archive button copy to match the archive mutation.
- Updated Brain table and sheet standardization notes.

Verification:

- Focused whitespace and exact archive/delete action-copy scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/customers/columns.tsx`
- `apps/dashboard/src/components/tables/customers/data-table.tsx`
- `apps/dashboard/src/components/tables/templates/columns.tsx`
- `apps/dashboard/src/components/tables/templates/data-table.tsx`
- `apps/dashboard/src/components/tables/core/types.ts`
- `apps/dashboard/src/components/forms/template-edit-form.tsx`
- `brain`

### Dashboard Table Action Meta Cleanup

Completed: 2026-06-10

Summary:

- Removed stale `deleteJob` and `enrichCustomer` callbacks from shared table meta.
- Removed an unused customer table action-menu separator import.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact stale table action meta scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/core/types.ts`
- `apps/dashboard/src/components/tables/customers/columns.tsx`
- `brain`

### Dashboard Zod Form Helper Typing

Completed: 2026-06-10

Summary:

- Tightened the shared dashboard `useZodForm` helper around Zod form schemas.
- Removed local `any` usage from the helper's schema generic and resolver wiring.
- Updated Brain sheet/form standardization notes.

Verification:

- Focused whitespace and exact `useZodForm` loose-typing scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-zod-form.ts`
- `brain`

### Dashboard Onboarding Metadata Export Alignment

Completed: 2026-06-10

Summary:

- Replaced the onboarding route's async `generateMetadata` function with a static `metadata` export.
- Kept the existing onboarding title and description unchanged.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact onboarding metadata scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/onboarding/page.tsx`
- `brain`

### Dashboard API Sort Helper Typing

Completed: 2026-06-10

Summary:

- Typed the shared API table sort helper with Prisma order-by input types.
- Removed loose `any` return and fallback types from dashboard table sort resolution.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact API sort-helper loose-typing scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/api/src/routers/_app.ts`
- `brain`

### Dashboard Job Status Label Alignment

Completed: 2026-06-10

Summary:

- Added shared display labels for service job statuses.
- Reused those labels in jobs filter options and jobs table status badges.
- Kept status values and API filter behavior unchanged.
- Updated Brain table standardization notes.

Verification:

- Focused whitespace and exact job status-label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-job-filter-params.ts`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `apps/dashboard/src/components/tables/jobs/columns.tsx`
- `brain`

### Follow-Up Create Date Control Alignment

Completed: 2026-06-10

Summary:

- Replaced the follow-up create sheet due-date native date input with the shared calendar-popover control.
- Matched the date field interaction pattern already used by the job create sheet.
- Removed the now-unused date-input formatting helper.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact follow-up date-control scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/follow-up-create-form.tsx`
- `brain`

### Follow-Up Sheet Date Control Alignment

Completed: 2026-06-10

Summary:

- Replaced the remaining native date inputs in schedule follow-up and follow-up work reschedule forms with the shared calendar-popover control.
- Removed the now-unused date-input formatting helpers from both forms.
- Kept existing follow-up scheduling and rescheduling mutations unchanged.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact native-date-control scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/schedule-follow-up-form.tsx`
- `apps/dashboard/src/components/forms/follow-up-work-form.tsx`
- `brain`

### Job Create Amount Control Alignment

Completed: 2026-06-10

Summary:

- Replaced the job create sheet amount native number input with the shared `CurrencyInput` primitive.
- Kept the form value as dollars and preserved the existing submit conversion to cents.
- Removed the now-unused `Input` import from the job create form.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact job amount-control scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/job-create-form.tsx`
- `brain`

### Overview Local Follow-Up Type Cleanup

Completed: 2026-06-10

Summary:

- Removed unused overview-local follow-up status and channel type aliases.
- Kept `DashboardOverviewData` as the only overview-specific exported data type.
- Left shared follow-up status/channel concepts owned by the filter/domain hook.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact overview type-alias scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/overview-types.ts`
- `brain`

### Overview Status Tone Type Alignment

Completed: 2026-06-10

Summary:

- Typed the overview status tone map with the shared `FollowUpStatus` union.
- Kept tone values and runtime rendering unchanged.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact overview tone-map type scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/constants.ts`
- `brain`

### Overview Follow-Up Status Tone Alignment

Completed: 2026-06-10

Summary:

- Updated priority follow-up badge tone selection to use normalized follow-up statuses.
- Updated follow-up health status tone lookup to use normalized follow-up statuses.
- Preserved unknown-status fallbacks and all shared label rendering.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact overview status-tone scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/priority-follow-ups.tsx`
- `apps/dashboard/src/components/widgets/follow-up-health-card.tsx`
- `brain`

### Overview Follow-Up Label Map Alignment

Completed: 2026-06-10

Summary:

- Removed duplicate follow-up status and channel label maps from overview widget constants.
- Reused shared follow-up status labels in priority follow-ups and follow-up health widgets.
- Reused shared follow-up channel labels in channel cards and workload summary widgets.
- Preserved widget-local status tone styling and unknown-value fallbacks.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact overview follow-up label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/constants.ts`
- `apps/dashboard/src/components/widgets/channel-cards.tsx`
- `apps/dashboard/src/components/widgets/workload-card.tsx`
- `apps/dashboard/src/components/widgets/priority-follow-ups.tsx`
- `apps/dashboard/src/components/widgets/follow-up-health-card.tsx`
- `brain`

### Table Badge Display Label Alignment

Completed: 2026-06-10

Summary:

- Replaced raw follow-up status badge text with the shared follow-up status label map.
- Replaced raw follow-up channel badge text with the shared follow-up channel label map.
- Replaced raw template channel badge text with the shared template channel label map.
- Preserved fallback rendering for unknown values.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact table badge label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/tables/follow-ups/columns.tsx`
- `apps/dashboard/src/components/tables/templates/columns.tsx`
- `brain`

### Sheet Missing State Card Alignment

Completed: 2026-06-10

Summary:

- Converted the shared sheet missing-record state from a hand-rolled bordered block to shared `Card` and `CardContent` primitives.
- Preserved the close action, titles, descriptions, and all sheet callers.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact sheet missing-state card scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/sheet-missing-state.tsx`
- `brain`

### Dashboard Date Filter Control Alignment

Completed: 2026-06-10

Summary:

- Added a shared dashboard `DateRangeFilter` component backed by the calendar range picker.
- Replaced duplicated native date inputs in jobs completed-date and follow-up due-date filter menus.
- Preserved the existing `start` and `end` URL filter params and filter chip behavior.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact date-filter scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/date-range-filter.tsx`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `apps/dashboard/src/components/follow-up-search-filter.tsx`
- `brain`

### Dashboard Error Fallback State Alignment

Completed: 2026-06-10

Summary:

- Replaced the bare shared dashboard error fallback with a structured card-style retry state.
- Preserved the existing refresh retry behavior used by dashboard page error boundaries.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact shared fallback scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/error-fallback.tsx`
- `brain`

### Settings Card Section Alignment

Completed: 2026-06-10

Summary:

- Wrapped workspace settings in a card-style settings section to match the Appearance card.
- Grouped Settings page sections with shared vertical spacing instead of one-off margins.
- Updated the workspace settings skeleton to render in the same card shell.
- Updated Brain page and workspace settings notes.

Verification:

- Focused whitespace and exact settings card-section scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `apps/dashboard/src/components/forms/update-workspace-form.tsx`
- `brain`

### Billing Plan Label Alignment

Completed: 2026-06-10

Summary:

- Added billing plan and plan-status display labels in the dashboard billing component.
- Replaced raw plan/status badge and metric copy with user-facing labels.
- Kept billing API response values and entitlement logic unchanged.
- Updated Brain billing notes.

Verification:

- Focused whitespace and exact billing label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/billing-overview.tsx`
- `brain`

### Template Edit Sheet Missing State

Completed: 2026-06-10

Summary:

- Replaced the template edit sheet's missing-record skeleton fallback with a structured not-found state.
- Added a close action for stale or archived template URLs.
- Kept loading and successful edit form behavior unchanged.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact template missing-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/template-sheet.tsx`
- `brain`

### Dashboard Sheet Missing State Alignment

Completed: 2026-06-10

Summary:

- Added a shared `SheetMissingState` component for stale or missing record-backed sheets.
- Reused it in customer edit, follow-up work, schedule follow-up, and template edit sheets.
- Preserved skeletons for loading states while replacing final missing-record skeleton fallbacks.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact sheet missing-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/sheet-missing-state.tsx`
- `apps/dashboard/src/components/sheets/edit-customer-sheet.tsx`
- `apps/dashboard/src/components/sheets/follow-up-card-sheet.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `apps/dashboard/src/components/sheets/template-sheet.tsx`
- `brain`

### Follow-Up Filter Label Alignment

Completed: 2026-06-10

Summary:

- Added shared display labels for follow-up statuses and channels.
- Reused those labels in follow-up filter options and filter chips.
- Kept URL filter values and API filter behavior unchanged.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact follow-up filter label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-follow-up-filter-params.ts`
- `apps/dashboard/src/components/follow-up-search-filter.tsx`
- `brain`

### Template Filter Label Alignment

Completed: 2026-06-10

Summary:

- Added shared display labels for template channels.
- Reused those labels in template filter options and filter chips.
- Kept URL filter values and API filter behavior unchanged.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact template filter label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-template-filter-params.ts`
- `apps/dashboard/src/components/templates-search-filter.tsx`
- `brain`

### Sheet Channel Option Label Alignment

Completed: 2026-06-10

Summary:

- Replaced duplicated channel option label arrays in template create/edit forms.
- Replaced duplicated channel option label arrays in follow-up create/schedule forms.
- Reused the shared template and follow-up channel label maps already used by filters.
- Kept submitted channel values and API schemas unchanged.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact channel-option scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/template-create-form.tsx`
- `apps/dashboard/src/components/forms/template-edit-form.tsx`
- `apps/dashboard/src/components/forms/follow-up-create-form.tsx`
- `apps/dashboard/src/components/forms/schedule-follow-up-form.tsx`
- `brain`

### Settings Page Layout Rhythm Alignment

Completed: 2026-06-10

Summary:

- Removed the extra settings page badge/header block.
- Let the workspace and appearance cards provide the settings section structure.
- Kept the constrained `max-w-[800px]` Midday settings width and increased section rhythm to `space-y-12`.
- Confirmed the authenticated sidebar shell already matches Midday's `px-4 md:px-8` content padding.
- Updated Brain page and workspace settings notes.

Verification:

- Focused whitespace and exact settings layout scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/app/(sidebar)/settings/page.tsx`
- `brain`

### Follow-Up Channel Select Control Alignment

Completed: 2026-06-10

Summary:

- Changed follow-up create channel select from uncontrolled default value to controlled value.
- Changed schedule follow-up channel select from uncontrolled default value to controlled value.
- Preserved shared channel labels, submitted values, and validation schemas.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact controlled-select scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/follow-up-create-form.tsx`
- `apps/dashboard/src/components/forms/schedule-follow-up-form.tsx`
- `brain`

### Filter Date Range Chip Alignment

Completed: 2026-06-10

Summary:

- Collapsed start/end date filters into one displayed range chip when both are set.
- Kept single-bound chips for start-only or end-only date filters.
- Made date filter chip removal clear both date params together, matching the date-range picker behavior.
- Preserved URL params, API filter inputs, and date picker behavior.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact date-chip behavior scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/filter-list.tsx`
- `brain`

### Filter No-Results Detection Alignment

Completed: 2026-06-10

Summary:

- Tightened customer filter `hasFilters` to count search text or non-empty tag arrays.
- Tightened follow-up filter `hasFilters` to count search text, valid status/channel values, or date bounds.
- Tightened template filter `hasFilters` to count search text or valid channel values.
- Kept table queries, URL params, API inputs, and filter chip rendering unchanged.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact `hasFilters` scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/hooks/use-customer-filter-params.ts`
- `apps/dashboard/src/hooks/use-follow-up-filter-params.ts`
- `apps/dashboard/src/hooks/use-template-filter-params.ts`
- `brain`

### Filter Option Empty State Alignment

Completed: 2026-06-10

Summary:

- Added a shared `FilterMenuEmptyState` component for compact filter-menu empty rows.
- Reused it for customer tag, job category, and job customer filter menus.
- Preserved visible empty-state copy and filter option behavior.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact filter-empty-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/filter-list.tsx`
- `apps/dashboard/src/components/customers-search-filter.tsx`
- `apps/dashboard/src/components/jobs-search-filter.tsx`
- `brain`

### Template Filter Active-State Helper Alignment

Completed: 2026-06-10

Summary:

- Replaced inline template channel membership checks with the shared `toTemplateChannel` helper.
- Kept filter button active-state behavior aligned with template query normalization and no-results detection.
- Preserved URL params, API inputs, and filter option rendering.
- Updated Brain table/filter standardization notes.

Verification:

- Focused whitespace and exact template filter active-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/templates-search-filter.tsx`
- `brain`

### Overview Priority Follow-Up Empty State Alignment

Completed: 2026-06-10

Summary:

- Replaced the empty priority follow-ups table row with a structured card empty state.
- Added an icon, explanatory copy, and a small action linking to the follow-ups page.
- Kept populated priority follow-up table rendering unchanged.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact overview empty-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/priority-follow-ups.tsx`
- `brain`

### Overview Recent Job Status Label Alignment

Completed: 2026-06-10

Summary:

- Replaced inline recent job status formatting with the shared service job status label map.
- Added a small typed row component so each recent job can normalize its status before rendering.
- Preserved the recent jobs list layout, links, and unknown-status fallback.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact recent-job status-label scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/widgets/recent-jobs.tsx`
- `brain`

### Job Autocomplete Create Guard Alignment

Completed: 2026-06-10

Summary:

- Confirmed the shared combobox renders create actions first when `createPosition="first"` is set.
- Confirmed job customer, service-title, and category fields all use create-first autocomplete with `Create "..."` copy.
- Updated service-title and category create callbacks to trim and guard empty values like customer creation.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact job autocomplete create-guard scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/forms/job-create-form.tsx`
- `brain`

### Follow-Up Board Empty-State And Channel Label Alignment

Completed: 2026-06-10

Summary:

- Replaced the board-level dashed empty block with a structured card empty state.
- Added an icon, explanatory copy, and the existing create follow-up action.
- Replaced raw follow-up channel rendering on board cards with shared channel labels.
- Updated Brain page standardization notes.

Verification:

- Focused whitespace and exact follow-up board label/empty-state scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/boards/follow-ups-board.tsx`
- `brain`

### Dashboard Sheet Shell Standardization

Completed: 2026-06-10

Summary:

- Added a shared `DashboardSheetContent` helper for primary dashboard sheet shells.
- Migrated customer, job, follow-up, schedule, and template sheets to the shared helper.
- Preserved each sheet's URL-backed open state, query loading branches, forms, and missing-record states.
- Updated Brain sheet standardization notes.

Verification:

- Focused whitespace and exact dashboard sheet-shell scans only, per fast Bun monorepo command discipline.

Files changed:

- `apps/dashboard/src/components/sheets/dashboard-sheet-content.tsx`
- `apps/dashboard/src/components/sheets/customer-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/edit-customer-sheet.tsx`
- `apps/dashboard/src/components/sheets/follow-up-card-sheet.tsx`
- `apps/dashboard/src/components/sheets/follow-up-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/job-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/schedule-follow-up-sheet.tsx`
- `apps/dashboard/src/components/sheets/template-create-sheet.tsx`
- `apps/dashboard/src/components/sheets/template-sheet.tsx`
- `brain`
