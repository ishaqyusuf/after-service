# ADR: Adopt Shared Local Infrastructure

## Status

Accepted

## Context

afterservice had project-specific environment loading, port cleanup, fixed-port
and Portless variants, and a static Compose file. Halaalvest and EwaTrade use a
shared four-mode local-infrastructure kit that keeps the selected mode file and
database target authoritative.

## Decision

Use the sibling `local-infra-kit` with the generic `afterservice` profile for
local, development, preview, and production command routing. Keep `bun run dev`
and `-f` package filters as the project interface, default local work to
Portless, derive Compose credentials and port from the selected `DATABASE_URL`,
and refuse a foreign process already occupying the configured local Postgres
port.

## Consequences

- `.env` is combined with exactly one mode file; production is never selected
  implicitly.
- Local mode starts repository-owned Docker Postgres when the URL points at the
  local managed port; hosted modes do not start local services.
- App, database, jobs, build, and port-cleanup commands share one environment
  authority.
- Local Trigger.dev runs materialize the allowlisted active profile in a
  short-lived `0600` env file so remote Trigger project variables cannot
  override the local database target; the launcher deletes the file on exit.
- The shared toolkit must remain available at the documented sibling path.

## Date

2026-08-30
