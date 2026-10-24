# 0025: Bind jobs to the Zeroes & One Trigger project

Date: 2026-10-24
Status: implemented and production delivery verified

## Context

The School Clerk AfterService project exhausted its monthly free credits.
The founder requested moving or creating a replacement in Zeroes & One. The
existing project settings exposed no transfer control. Zeroes & One has only
the same founder owner account and shows no exhausted-credit warning.

## Decision

Create `afterservice` (`proj_kirjkbvoswjxydkbdemr`) in `zeroes-one-9521`.
Keep the old project and history intact while validating the replacement.
`packages/jobs/trigger-project.json` is the non-secret project binding. Both
Trigger config and the CLI wrapper use it; an explicit `--project-ref` remains
available for deliberate alternate targets. Stale project IDs in shared dotenv
profiles cannot silently send future job deploys back to the retired project.

Production activation reuses the existing production DB/email authority under
the same Trigger owner, updates API/dashboard server keys without exposing
values, and rebuilds their exact live source. It does not grant a new person
access, purchase a plan, change application data, or alter the Vercel cron.
Retire old recurring schedules reversibly after replacement verification.
A no-recipient probe precedes a single explicitly approved email canary.

## Limits

Following explicit founder approval, only `TRIGGER_PROJECT_ID` and
`TRIGGER_SECRET_KEY` were aligned in root `.env` (development) and
`.env.production` (production). All other assignments, including profile, were
preserved and verified. Existing running dev processes need a normal restart
to pick up changed environment values. Trigger run history and queued runs are not copied
or deleted. Credit availability is organization-wide, not a new per-project
allowance. API/dashboard rollback can use the old project credential, although
its organization's existing credit block remains.

Production DB and Resend values are stored as non-revealable Trigger secrets.
The older CLI defaults synced variables to revealable values; automatic sync
therefore excludes credentials. Non-secret config retains deployment sync.

## Production acceptance

Worker version `20261024.2` is promoted. A no-recipient probe completed, then
the dashboard created one approved email dispatch in the replacement project.
Its run completed with one email sent and zero failed; the matching single
message arrived in the founder Gmail inbox. API and dashboard exact-source
rebuilds are Ready and their canonical aliases verified. No purchase made.
