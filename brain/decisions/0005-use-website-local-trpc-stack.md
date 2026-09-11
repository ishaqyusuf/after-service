# ADR: Use Website-Local tRPC Stack

## Status
Accepted

## Context
The dashboard already uses the Midday-style tRPC setup with app-local client/server helpers, query prefetching, hydration support, and a same-origin `/api/trpc` route. The website previously did not have its own tRPC folder or provider, which made it diverge from the dashboard pattern and from the newer Anodizex setup.

## Decision
Add `apps/website/src/trpc` with client, server, and query-client helpers that point at the shared `@afterservice/api` router. Add a website same-origin `/api/trpc` route by re-exporting `@afterservice/api/internal-api`, and wrap the website app shell in a local providers component that mounts `TRPCReactProvider` alongside analytics and PWA registration.

Keep website and dashboard package build scripts simple as `bun next build --turbopack`; production environments must be supplied by the build runner rather than an app package build wrapper.

## Consequences
- Website and dashboard now share the same tRPC architecture shape.
- Future website pages can use typed `trpc.*.queryOptions()`, `prefetch`, `batchPrefetch`, and `HydrateClient`.
- The website can call API procedures through the same-origin `/api/trpc` path.
- App package build scripts are easier to reason about and no longer hide production env loading behavior.

## Date
2026-07-05
