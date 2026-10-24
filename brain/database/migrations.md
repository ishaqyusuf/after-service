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

## Oversight Reader — 2026-10-24

After explicit user approval of production activation and the exact six-table
read scope, provisioned `afterservice_oversight_reader_20261024` on the confirmed
Afterservice Neon target. No schema migration or business-data write occurred.
The role has column-level SELECT only on the query-required fields of Workspace,
User, Membership, Customer, ServiceJob and FollowUp; it has no application table
write or public-schema CREATE privilege. Connection limit is three, default
transactions are read-only and statement timeout is 15 seconds. The direct TLS
Neon connection avoids pooler startup-option restrictions. Real summary reads
for 7/30/90 days and all three directories passed under this role.

The initial command was rejected before execution by automatic approval review;
the user then explicitly approved this access scope, server configuration and
API/Oversight deployment. Credentials remain server-side and are never placed
in Brain, source, browser variables or a committed dotenv file. Future schema
changes may require separately reviewed column grants.

## QA Accelerator Migration

Production rollout on 2026-10-18 found missing nullable QA session columns
causing `prisma.session.create()` to fail during signup. A read-only Prisma
schema diff against the confirmed afterservice Neon target showed only the
three nullable session columns, five QA tables, indexes, and foreign keys were
missing. Existing production schema matched the rest of the current schema.
The database had no recorded migration history despite its existing tables,
so historical migrations were not replayed. The repository's confirmed-target
`bun run db:push --prod` applied the additive delta without data-loss flags.
The subsequent Prisma schema diff was empty and real signup/onboarding passed.
Production migration baselining remains future maintenance work; this did not
enable the internal QA routes, which continue to return 404 in production.

- `20260830010000_qa_accelerator` adds the five authorization/audit models and
  QA-derived session scope fields, indexes, and cascade behavior.
- Apply locally with `bun run db:migrate` after installing workspace
  dependencies. Apply to hosted environments only through the normal reviewed
  migration workflow.
- Migration application was not performed during the original source implementation
  because this checkout has no installed Prisma executable or dependencies.
# QA cleanup schema

- Adds global platform roles, workspace QA lifecycle fields, and purge receipts.
- Apply the repository's existing migrate and production push workflow before
  enabling the maintenance API/job.


## Retained Isolated Preview — 2026-10-19

Created the schema-only `qa-preview-20261019` Neon branch without copying
production rows; Prisma push reported the schema already in sync. No new
business schema migration was required. The user approved retaining the branch
and using `afterservice_preview_qa` only in Vercel Preview. Runtime grants cover
existing tables/sequences and exclude CREATE/TRUNCATE/admin capabilities. Future
schema maintenance requires an authorized owner connection and refreshing
object grants. See ADR 0016 and the preview acceptance handoff.

## 20261024010000_operations_assistant

Additive migration creates six assistant tables, their unique/index/foreign-key
constraints and `ServiceJob.currency` with default USD. Generated from the copied
baseline Prisma schema. Applied and tested only in the separate local
`afterservice_assistant` database; not applied to hosted databases by this task.

### Production migration verification — 2026-10-24

Preflight found missing prompt/capability-version columns in the original SQL
artifact. Regenerated through the explicit Prisma config, applied the exact SQL
to a separate local baseline database, and confirmed no schema diff. The read-only
production diff then matched that tested SQL byte for byte: six assistant tables
and `ServiceJob.currency`, with no drops. Applied in one transaction with bounded
lock/statement timeouts; existing user/customer/job/follow-up counts were unchanged.
The post-apply production diff is empty. Existing production has no Prisma
migration-history table, so historical migrations were not replayed.
