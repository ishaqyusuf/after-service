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
