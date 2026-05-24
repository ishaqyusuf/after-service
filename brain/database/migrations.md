# Database Migrations

## Purpose
This file defines migration policy.

## Tooling
Prisma migrations will be introduced in Phase 5.

## Rules
- Generate migrations from reviewed schema changes.
- Keep migration names descriptive.
- Avoid destructive migrations without explicit backup/rollout notes.
- Do not hand-edit generated migration SQL unless necessary and documented.
- Run migration validation before handoff.

## Expected Commands
```bash
bun run db:generate
bun run db:migrate
```

## Migration Checklist
- Schema validates.
- Migration applies locally.
- Generated client updates.
- API and dashboard typecheck.
- Brain schema docs updated.

## Pending
- Add Prisma package.
- Add Postgres datasource.
- Add initial migration.
