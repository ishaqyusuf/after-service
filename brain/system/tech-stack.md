# Tech Stack

## Purpose
This file records core technology choices.

## Runtime And Tooling
- Runtime/package manager: Bun
- Monorepo orchestration: Turborepo
- Language: TypeScript
- Formatting/linting: Biome

## Apps
- Website: Next.js App Router
- Dashboard: Next.js App Router
- API: Hono with tRPC

## Data And Auth
- Database: Postgres
- ORM: Prisma planned for Phase 5
- Auth: Better Auth-style package architecture planned for Phase 6

## Billing
- Provider: Lemon Squeezy
- Model: recurring subscriptions
- Entitlements: persisted from webhook-confirmed subscription state

## Local Ports
- Website: `4100`
- Dashboard: `4101`
- API: `4102`

## Domains
- Website: `afterservice.app`
- Dashboard: `app.afterservice.app`
- API: `api.afterservice.app`
