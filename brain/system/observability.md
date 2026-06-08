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
- The public website emits `First Site Visit` once per browser/device when `AFTERSERVICE_FIRST_SITE_VISIT_ID` is first created.
- First-site-visit attribution captures first-touch landing path, search string, referrer, and UTM parameters.
- The first-visit ID and tracked marker use long-lived, host-only cookies with `SameSite=Lax`; localStorage is used as an additional tracked marker when available.

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
