# Repo Structure

## Purpose
This file documents where code belongs in the afterservice monorepo.

## Root
- `package.json`: workspace scripts and shared dev dependencies.
- `turbo.json`: task graph.
- `.env.example`: committed env contract.
- `.env`: local secrets and local defaults, ignored.
- `.env.production`: production secret values, ignored.
- `brain/`: durable project docs.

## Apps
`apps/website`
- Public marketing app.
- Owns home, pricing, login/signup entry pages, public legal pages.

`apps/dashboard`
- Authenticated operator app.
- Owns onboarding, customers, jobs, follow-up board, templates, billing, settings.

`apps/api`
- Hono/tRPC API.
- Owns typed business operations, auth context, workspace permissions, webhooks, and job endpoints.

## Packages
`packages/auth`
- Session and user types.
- Auth route constants.
- Future Better Auth integration.

`packages/db`
- Prisma schema and generated client once Phase 5 starts.
- Domain enums/types.
- Query helpers that are not API-specific.

`packages/ui`
- Shared React components.
- Should avoid app-specific business logic.

`packages/utils`
- Pure helpers.

`packages/notifications`
- Message payloads and future provider abstractions.

`packages/jobs`
- Scheduled and background job logic.

`packages/site-nav`
- Navigation registries and route labels.

`packages/tsconfig`
- Shared TypeScript presets.

## Placement Rules
- App-specific UI stays in the app.
- Shared UI with no business dependency can move to `packages/ui`.
- Domain types shared by API/dashboard/jobs belong in `packages/db` or a future domain package.
- External provider logic should sit behind a package or API module boundary.
