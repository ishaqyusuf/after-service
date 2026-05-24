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
bun run build
```
