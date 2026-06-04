# afterservice Project Brain

## Purpose
This is the durable project memory for afterservice. It gives humans and AI agents a single source for product intent, architecture, roadmap, API/database contracts, engineering rules, and implementation state.

## How To Use
- Read `PROJECT_INDEX.md` first to find the right document.
- Update the relevant brain file in the same change as any meaningful product, architecture, schema, API, or workflow change.
- Prefer concise, dated decisions over scattered notes.
- Keep the product name as `afterservice` and the repo name as `after-service`.

## Current State
- Phase 1 scaffold is complete.
- Repo: `/Users/M1PRO/Documents/code/micro-startups/after-service`
- Architecture target: Plot Keys-style Bun/Turbo monorepo.
- Apps:
  - `apps/website`: marketing site for `afterservice.app`.
  - `apps/dashboard`: operator dashboard for `dashboard.afterservice.app`.
  - `apps/api`: Hono/tRPC API for `api.afterservice.app`.
- Shared packages exist as placeholders under `packages/*`.

## Product Summary
afterservice is after-service follow-up software for local operators. It helps service businesses turn completed work into structured customer check-ins, review requests, repeat visits, issue resolution, and referrals.

## Canonical Roadmap
The canonical detailed roadmap lives in `brain/product/roadmap.md`. The execution checklist lives in `brain/tasks/roadmap.md`.

## Core Engineering Docs
- AI prompt rules: `brain/AI_PROMPT_RULES.md`
- Coding standards: `brain/engineering/coding-standards.md`
- Repo structure: `brain/engineering/repo-structure.md`
- Reference projects: `brain/system/reference-projects.md`

## Naming Rules
- Product: `afterservice`
- Domain: `afterservice.app`
- Repo: `after-service`
- Package namespace: `@afterservice/*`
- Do not use earlier placeholder names or inherited product branding in product code or docs except when explicitly referencing architecture ancestry.


## Important Project References
- `midday`: `/Users/M1PRO/Documents/code/_kitchen_sink/midday`
- `gnd`: `/Users/M1PRO/Documents/code/_turbo/gnd`
- `school-clerk`: `/Users/M1PRO/Documents/code/school-clerk`
- `halaal-coperative`: `/Users/M1PRO/Documents/code/halaal-coperative`
- `plot-keys`: `/Users/M1PRO/Documents/code/plot-keys`
