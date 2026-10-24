# 0017: Use a read-only Oversight portfolio integration

Date: 2026-10-24
Status: accepted

## Context

Afterservice has traffic in Logly but its existing Oversight registry entry has
no operational connection. Oversight's original summary validator accepts only
EwaTrade, and its order UI cannot accurately represent jobs without currency.

## Decision

Add versioned authenticated reads to the standalone Afterservice API using its
existing Hono schema/router and Prisma query boundaries. Use a separate
SELECT-only database login, an independent bearer key, explicit activation and
read-only database defaults. Share only the portfolio directory fields and
aggregate product counts. No schema migration or operational write capability.

Extend Oversight's existing contract for Afterservice, verify response project
identity, and label jobs in service terms. Preserve nullable money rather than
inventing a currency. Use explicit workspace QA classification and explain that
normal counts may include unclassified internal data. Keep visitor/event
analytics in Logly. Preserve both repositories' pre-existing uncommitted work.

## Consequences

The API and Oversight require coordinated deployment and server configuration.
Unavailable data remains unavailable. The reporting read key grants global
portfolio reads only; browser/workspace sessions cannot use it. No customer
outreach, campaign sending or workspace suspension is introduced.
