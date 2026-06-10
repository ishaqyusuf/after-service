# Dashboard Pages Redacted tRPC Prefetch Failure

## Summary
Authenticated dashboard pages failed to load in production with a Vercel server-render error showing `Error: redacted`.

## Status
Fixed in code on 2026-06-10. Production verification is pending deployment.

## Impact
Signed-in users could not load dashboard pages such as overview, jobs, customers, follow-ups, templates, billing, and settings.

## Steps To Reproduce
1. Deploy the dashboard with production env where `NEXT_PUBLIC_API_URL=https://dashboard.afterservice.app/api`.
2. Sign in and open any authenticated dashboard route.
3. Observe the Vercel server-render failure with a redacted digest.

## Expected
Dashboard routes should render, hydrate prefetched data when available, and use the public API base under `https://dashboard.afterservice.app/api`.

## Actual
Server-side React Query prefetch failures were redacted during dehydration, causing the page render to fail before the client fallback UI could recover.

## Root Cause
Dashboard SSR tRPC prefetching depended on an HTTP client URL derived from `NEXT_PUBLIC_API_URL` plus `/trpc`, while the browser client used `/trpc`. This left production behavior split between `/api/trpc` and `/trpc`, and made route rendering vulnerable to Vercel/API proxy routing failures.

## Fix
- Dashboard server prefetches now call the shared `appRouter` in-process with the current request headers, avoiding production self-fetch/proxy failures during render.
- Dashboard browser tRPC calls now use `/api/trpc`, matching the canonical public API base `https://dashboard.afterservice.app/api`.
- Dashboard exposes a same-origin `/api/trpc/[trpc]` route backed by the shared API router.
- The API service accepts both `/api/trpc/*` and legacy `/trpc/*`.

## Verification
- Pending: deploy and open authenticated dashboard routes.
- Pending: run a production smoke check against `https://dashboard.afterservice.app/api/trpc`.
