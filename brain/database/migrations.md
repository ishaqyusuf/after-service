# Database Migrations

## Purpose
This file defines migration policy.

## Tooling
Prisma migrations will be introduced in Phase 5.

## Rules

- Use the repository DB push command against the intended database profile for schema readiness checks.
- If profile flags are added to this repo, use `bun run db:push --local` for local checks and `bun run db:push --prod` only for explicitly requested production validation/push after confirming the target database and risk. Do not force data-loss prompts or destructive changes without approval.
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
# QA cleanup schema

- Adds global platform roles, workspace QA lifecycle fields, and purge receipts.
- Apply the repository's existing migrate and production push workflow before
  enabling the maintenance API/job.
