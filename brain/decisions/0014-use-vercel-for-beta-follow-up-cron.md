# ADR 0014: Run Beta Follow-Up State Processing On Vercel

Date: 2026-10-18
Status: Accepted

## Context

The user requested completing production cron without depending on browser
access or Trigger credits. The deployed Trigger hourly overdue task is blocked
by exhausted credits. The API is independently hosted on Vercel. Its current
team plan is Hobby, which supports daily cron rather than hourly execution.

## Decision

Vercel Cron on the API project is the authoritative production schedule for
`GET /api/jobs/follow-ups/mark-missed`, configured as `0 7 * * *` (07:00 UTC,
08:00 Africa/Lagos). Hobby invocation can occur within that hour; this is daily
housekeeping, not a precise-time reminder or customer delivery promise.

The handler requires a production-only `CRON_SECRET`, uses the server clock,
rejects query overrides, disables caching, and logs aggregate results only.
It calls the existing atomic, repeatable status update: overdue `open` and
`scheduled` follow-ups become `missed`; contacted, replied, closed, and future
items remain unchanged. It sends no notifications and creates no message logs.

Keep the existing POST endpoint for authenticated scoped dry-runs and recovery.
Remove the declarative Trigger clock and deactivate only its existing
production `mark-missed-follow-ups` schedule once Vercel is active. The Trigger
task remains manually callable. Other Trigger tasks/schedules remain unchanged.

## Consequences

Processing continues without Trigger credits. Repeated or overlapping runs are
safe because the update predicate excludes already missed records. Failed runs
are visible in Vercel function logs; Vercel does not automatically retry them.
Use an authenticated manual run for recovery. Revisit frequency with real beta
usage; an hourly schedule requires a supported hosting plan or another approved
scheduler, not an automatic plan upgrade.

## References

- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://vercel.com/docs/cron-jobs/usage-and-pricing
