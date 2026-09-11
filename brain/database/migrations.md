# Database Migrations

## Purpose
This file defines migration policy.

## Tooling
Prisma migrations are stored in `packages/db/prisma/migrations` and run through
the shared local-infrastructure profile commands.

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

## QA Accelerator Migration

- `20260830010000_qa_accelerator` adds the five authorization/audit models and
  QA-derived session scope fields, indexes, and cascade behavior.
- Apply locally with `bun run db:migrate` after installing workspace
  dependencies. Apply to hosted environments only through the normal reviewed
  migration workflow.
- Migration application was not performed during the source implementation
  because this checkout has no installed Prisma executable or dependencies.
# QA cleanup schema

- Adds global platform roles, workspace QA lifecycle fields, and purge receipts.
- Apply the repository's existing migrate and production push workflow before
  enabling the maintenance API/job.
