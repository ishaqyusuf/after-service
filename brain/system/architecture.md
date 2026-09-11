# Architecture

## Purpose
This file documents the intended technical architecture for afterservice.

## Monorepo
The repo is a Bun/Turbo workspace with:
- `apps/website`
- `apps/dashboard`
- `apps/api`
- `packages/auth`
- `packages/db`
- `packages/jobs`
- `packages/notifications`
- `packages/site-nav`
- `packages/tsconfig`
- `packages/ui`
- `packages/utils`

## Apps
`apps/website` is a Next.js marketing app. It owns public content, pricing, and signup entry points.

`apps/dashboard` is a Next.js authenticated app. It owns operator workflows: onboarding, customers, service jobs, follow-up board, templates, billing, and settings.

`apps/api` is a Hono/tRPC API. It owns typed business operations, auth context, workspace permissions, billing webhooks, and future job endpoints.

## Shared Packages
- `auth`: session resolution, auth routes, workspace membership helpers.
- `db`: Prisma/Postgres schema, generated client, query helpers, domain types.
- `ui`: shared React components.
- `utils`: pure shared utilities.
- `notifications`: message contracts and provider abstractions.
- `jobs`: scheduled/background job primitives.
- `site-nav`: dashboard and website navigation constants.
- `tsconfig`: shared TypeScript presets.
- `events`: thin Afterservice typed-event compatibility wrapper around the
  installable Logly browser/Next.js/server SDK packages. Its names improve
  application DX but are not a collector allowlist.

## Data Flow
Dashboard pages call typed tRPC procedures. API procedures resolve session and workspace membership, enforce permissions, perform database operations, and return typed results. Billing webhooks update persisted subscription state, which API entitlement helpers use for feature gates.

Optional analytics follows a separate path: the public website sends bounded
batches to a same-origin route, which authenticates to the central Logly
collector with a project-scoped `client-ingest` key. Trusted API events use a
`server-write` key. Reporting uses a `read` key. Logly owns project isolation,
HMAC visitor/actor keys, persistence, retention, and shared reads.

For local end-to-end QA, the same route points to `logly.localhost` with
local-only scoped credentials while both products run through shared
`local-infra-kit` profiles and separate Docker PostgreSQL containers. The
explicit enable switch, not `NODE_ENV`, controls whether optional analytics is
active, so local testing exercises the production-shaped delivery path.

The local Trigger.dev launcher receives the same resolved local-infra profile.
Because Trigger.dev normally gives remote project variables precedence over its
parent process, `scripts/with-trigger-profile.mjs` writes only the allowlisted
worker variables to a mode-specific `0600` temporary env file and passes that
file to `trigger dev`. Trigger gives the explicit file final precedence and the
launcher removes it on worker exit or termination. This prevents local jobs
from connecting to production PostgreSQL or using a different analytics/email
configuration.

## Boundary Rules
- UI never trusts client-provided workspace IDs without server-side membership checks.
- Billing UI can start checkouts, but only webhooks update entitlements.
- Jobs can read due follow-ups, but message sending must be behind provider configuration.

As of 2026-07-05, `apps/website` owns its own tRPC client/server stack under `apps/website/src/trpc`, matching the dashboard Midday-style tRPC pattern. The website exposes a same-origin `/api/trpc` route backed by the shared API router and wraps the app shell in `TRPCReactProvider` through `apps/website/src/app/providers.tsx`.

## Non-Production QA Accelerator

- `local-infra-kit` owns four-mode environment and database routing.
- Dashboard `.qa.ts` handlers expose the versioned authorization lifecycle only
  in enabled local/development/preview builds.
- Digest-backed grants and authorizations resolve domain-matching QA workspace
  profiles into short-lived ordinary Better Auth sessions.
- API and dashboard contexts revalidate the authorization plus exact
  membership/workspace scope before serving a QA-derived session.
- Shared effect policy executes before notification or Polar provider calls.
- Production route extensions and Turbopack aliases remove QA server/client
  capability from production artifacts.
