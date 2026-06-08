# Observability

## Purpose
This file captures the MVP observability baseline for afterservice production readiness.

## MVP Logging
- API, dashboard, website, cron, and webhook runtime logs should be retained by the deployment platform.
- `LOG_LEVEL=info` is the default production setting.
- Billing webhooks persist every accepted provider event in `BillingEvent`.
- Follow-up status changes, reschedules, replies, closes, and manual sends are persisted as `FollowUpEvent` records.
- Manual outreach creates `MessageLog` records; automated outbound messaging remains disabled unless explicitly configured.

## Marketing Analytics
- OpenPanel owns unique visitor and first-touch tracking for the public website.
- afterservice should avoid custom first-visit cookies/localStorage unless OpenPanel cannot cover a required attribution use case.

## Error Monitoring
- `SENTRY_DSN` is documented in `.env.example` as the default error-monitoring hook.
- A production deploy should configure source maps, release identifiers, and alerts for API/dashboard exceptions before live customer data is collected.

## Alerts
- Alert on repeated 5xx responses from `api.afterservice.app`.
- Alert on Lemon Squeezy webhook verification or processing failures.
- Alert on failed cron/job endpoint runs.
- Alert on database connection saturation or migration failures.

## Health Checks
- API health: `GET https://api.afterservice.app/health`.
- Cron dry-run: `POST https://api.afterservice.app/api/jobs/follow-ups/dry-run` with `CRON_SECRET`.
- Lemon webhook target: `POST https://api.afterservice.app/webhooks/lemon-squeezy`.
