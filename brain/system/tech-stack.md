# Tech Stack

## Purpose
This file records core technology choices.

## Runtime And Tooling
- Runtime/package manager: Bun
- Monorepo orchestration: Turborepo
- Language: TypeScript
- Formatting/linting: Biome

## Apps
- Website: Next.js App Router (`next@^16.3.0`, React 19.2.x)
- Dashboard: Next.js App Router (`next@^16.3.0`, React 19.2.x)
- API: Hono with tRPC
- Dashboard theme management: `next-themes` with class-based light/dark/system mode.

## Dependency Notes
- 2026-08-04: Upgraded the monorepo Next.js packages to `next@^16.3.0` while retaining React 19.2.x.
- 2026-06-10: Aligned the monorepo Next.js packages on `next@^16.2.9` and React packages on 19.2.x. This keeps the website, dashboard, and shared UI package on one Next/React line.
- 2026-06-10: Website and dashboard typography should match the Midday reference project by using `Hedvig_Letters_Sans` and `Hedvig_Letters_Serif` through Next font variables `--font-hedvig-sans` and `--font-hedvig-serif`.

## Data And Auth
- Database: Postgres
- ORM: Prisma planned for Phase 5
- Auth: Better Auth-style package architecture planned for Phase 6

## Billing
- Provider: Polar
- Model: recurring subscriptions
- Entitlements: persisted from webhook-confirmed subscription state

## Local Ports
- Website: `4100`
- Dashboard: `4101`
- API: `4102`
- Local named-host dev: Portless-capable workspace scripts. Website/dashboard QA should use `bun run dev -f dashboard website`, then browse `afterservice.localhost` for website flows and `app-afterservice.localhost` for dashboard flows.
- Shared local infrastructure: sibling `local-infra-kit`, generic
  `afterservice` profile, `.env` plus one explicit mode file, Docker Postgres on
  the port encoded by local `DATABASE_URL`, and Portless by default.

## Domains
- Website: `afterservice.app`
- Dashboard: `dashboard.afterservice.app`
- Public API base: `dashboard.afterservice.app/api`

## Build Script Note
- Website and dashboard package-level build scripts intentionally stay simple as `bun next build --turbopack`; deploy/build runners must provide the required production environment directly.
- Website and dashboard both use app-local `src/trpc` folders for Midday-style server/client tRPC calls and same-origin `/api/trpc` routes.
