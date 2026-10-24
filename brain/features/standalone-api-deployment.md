# Standalone API deployment

Status: deployed and production verified on 2026-10-18. Deployment IDs and full
verification evidence are recorded in `brain/tasks/done.md`.

## Behavior

- Production API: `https://api.afterservice.app`.
- Dashboard browser auth and OAuth callbacks remain same-origin.
- Website and dashboard retain their existing same-origin tRPC routes.
- Both `/trpc/*` and `/api/trpc/*` are available on the API hostname.
- Exact trusted origins receive credentialed CORS headers; unknown origins do not.
- Authentication, membership, cron, and webhook verification remain enforced.
- Missing cron or webhook secrets fail closed with HTTP 503.

## Operations

- `bun run api:deploy`: deploy to the explicitly selected API project and run smoke checks.
- `bun run smoke:api [origin]`: 12 read-only or unauthorized-request production probes.
- `bun test apps/api/src/deployment.test.ts packages/utils/src/app-urls.test.ts`:
  local route/permission/CORS and production/local URL regression checks.
- Vercel production service credentials are scoped to the API project. Auth-aware
  apps share a production signing secret; rotation requires coordinated redeployment.
- Local secret files are excluded from uploads and are not modified by deployment.

## Decision

See `brain/decisions/0011-deploy-standalone-api-on-vercel.md`.
