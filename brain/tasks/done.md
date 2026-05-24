# Done

## Purpose
This file records completed work.

## Completed
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
