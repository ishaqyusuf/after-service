# afterservice

After-service follow-up software for local operators.

## Apps

- Website: `afterservice.app`
- Dashboard: `app.afterservice.app`
- API: `api.afterservice.app`

## Local Development

```bash
bun install
bun run dev
```

### Portless (named dev URLs)

Install [Portless](https://portless.dev) once, then run:

```bash
# All three apps
bun run dev:portless

# Or one app at a time
bun run dev:website:portless
bun run dev:dashboard:portless
bun run dev:api:portless

# Website + dashboard only
bun run dev:websites:portless
```

Expected Portless URLs (default proxy on port 1355):

| App       | URL                                       |
| --------- | ----------------------------------------- |
| Website   | `http://afterservice.localhost:1355`      |
| Dashboard | `http://app-afterservice.localhost:1355`  |
| API       | `http://api-afterservice.localhost:1355`  |

Fixed-port localhost URLs remain available:

| App       | URL                         |
| --------- | --------------------------- |
| Website   | `http://localhost:4100`     |
| Dashboard | `http://localhost:4101`     |
| API       | `http://localhost:4102`     |

## Environment

Environment configuration is loaded from the workspace root.

- Local development commands load `.env`.
- Production build/start commands load `.env.production`.
- `.env.example` documents the required keys and is safe to commit.

Use the root scripts when possible:

```bash
bun run dev:website
bun run dev:dashboard
bun run dev:api
bun run db:validate
bun run db:generate
bun run smoke:mvp
bun run build
```

`bun run smoke:mvp` expects the dashboard dev server to be running at
`http://localhost:4101` unless `SMOKE_DASHBOARD_URL` is set. It verifies the
local MVP journey: sign-up, onboarding, authenticated dashboard access,
workspace-scoped CRUD, follow-up status transitions, manual send logging,
permission rejection, entitlement limits, cron job authorization, and Lemon Squeezy webhook
signature/idempotency behavior.

## Deployment Notes

- Website: `https://afterservice.app`
- Dashboard: `https://app.afterservice.app`
- API: `https://api.afterservice.app`
- Lemon webhook: `https://api.afterservice.app/webhooks/lemon-squeezy`
- Follow-up cron job: `POST https://api.afterservice.app/api/jobs/follow-ups/dry-run` with `CRON_SECRET`
- Observability: retain platform logs, configure `SENTRY_DSN`, and alert on API 5xxs, webhook failures, cron failures, and database connection saturation.

## Terminal Scripts

Use the terminal script helper to discover and run common project commands:

```bash
bun run terminal
bun run terminal check
bun run terminal dashboard
bun run terminal db:validate
bun run terminal smoke:mvp
```
