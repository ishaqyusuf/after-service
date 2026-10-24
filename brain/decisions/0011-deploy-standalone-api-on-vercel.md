# 0011: Deploy the standalone API on Vercel

Date: 2026-10-18

## Decision

Use Ewatrade's standalone Hono/Bun deployment pattern for `apps/api`, served at
`https://api.afterservice.app` by the dedicated `after-service-api` Vercel project
(`prj_AFjHpqFEKDEJU8Wivz3REePoR0rc`). Its root is `apps/api` with access to
workspace sources outside the root. The API uses the same production database
and auth signing secret as the existing application.

## Implementation

- Export the shared Hono app from `src/index.ts`; keep Bun's local port/server
  object in `src/local.ts`.
- Generate Prisma and bundle workspace imports with Bun (`--env=disable`) in
  Vercel's disposable checkout, then expose a small Hono forwarding entrypoint.
- Refuse to rewrite sources outside a Vercel build environment.
- Exclude env files, local build output, and agent artifacts from deployment uploads.
- Target the API project explicitly in `bun run api:deploy`, followed by the
  reusable production smoke suite.
- Use a root API origin; retain both tRPC mounts and exact-origin CORS across them.
- Preserve dashboard browser OAuth callbacks, host-scoped cookies, and existing
  same-origin Next.js handlers. A user-approved signing-secret rotation keeps
  auth-aware deployments consistent and signs out existing sessions once.

## Consequences

The API can deploy independently. Vercel's API build does not need the sibling
local-infra repository. Database schema and business permissions are unchanged.
Future production signing-secret rotations must update every auth-aware app
and redeploy them together. Service credentials remain project-scoped and sensitive.
