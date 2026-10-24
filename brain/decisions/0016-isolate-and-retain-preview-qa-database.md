# ADR 0016: Isolate And Retain The Preview QA Database

Date: 2026-10-19
Status: Accepted

## Decision

Dashboard Vercel Preview uses the schema-only Neon branch
`qa-preview-20261019` (`br-shiny-hall-aq8x51kx`) rather than the production
database. The user approved retaining this branch for ongoing QA; its expiration
is Never. The stable protected preview URL is
`https://after-service-qa-preview.vercel.app`.

The dedicated `afterservice_preview_qa` runtime login has database CONNECT,
schema USAGE, table SELECT/INSERT/UPDATE/DELETE, and sequence USAGE/SELECT.
It has no superuser, database/role creation, schema CREATE, or table TRUNCATE
privileges. Future schema maintenance uses a separately authorized owner
connection, followed by grants for newly created runtime tables/sequences.
Runtime privileges cover current objects; no default grants were added.

Shared Vercel environment entries were split by target before creating isolated
Preview values. Production values were preserved. Preview uses its own auth/QA
secrets, same-origin API, exact allowed origin, console email mode and an invalid
email sink. Google, Resend, Logly, checkout, and worker delivery are excluded
from this QA environment. No production rows were copied.

## Consequences

Preview supports ordinary workspace-scoped sessions and deterministic draft QA
without accessing production records. Issue short-lived exact-domain tester
grants for each test window and revoke them afterward; never put grants or
database credentials in reports. Retention keeps synthetic fixtures available
but requires deliberate maintenance. A purge preview is read-only; execution
requires separate review and the Trigger worker. Retention does not authorize
purging or provider delivery.
