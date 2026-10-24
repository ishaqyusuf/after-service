# ADR 0015: Use Operator Timezone For Follow-Up Calendar Views

Date: 2026-10-19
Status: Accepted

## Context

Production browser acceptance found that a Lagos-local midnight could fall on the
previous UTC day. Server-local end-of-day grouping disagreed with the date shown
in the dashboard. Sent overdue records could also appear in two board columns.

## Decision

`followUps.listBoard` and `dashboard.overview` accept an optional validated IANA
`timeZone`, default UTC. The browser requests its own timezone after stable UTC
hydration; timezone is part of the query key. Shared database-query helpers compare
local calendar date keys rather than server-local end-of-day instants. Weekly
metric windows use the same calendar, with an indexed coarse database bound and
an exact timezone filter for completed jobs.

Board stages are exclusive. Sent is Waiting; replied and closed have their own
stages. Uncontacted open/scheduled/missed work is Due today when due today or
earlier, otherwise Upcoming. Overview reports due today and overdue separately.

## Consequences

No schema migration or due-instant rewrite is required. Operators in different
timezones may see different day grouping for the same instant. Existing callers
without a timezone consistently use UTC. Initial SSR UTC content may briefly
appear before the browser-specific query resolves. A persisted workspace timezone
is a separate future product decision. Cron still evaluates absolute due instants.
