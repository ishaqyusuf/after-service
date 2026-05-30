# Feature: Notifications MVP Foundation

## Status
Implemented manual-send foundation on 2026-05-30.

## Scope
- `packages/notifications` defines message payload/provider contracts.
- Manual-only provider is the default safe implementation.
- Follow-up `markSent` logs a `MessageLog` and `FollowUpEvent`.

## Architecture
- Reference standard: GND notification package architecture.
- Package owner: `packages/notifications/src/index.ts`.
- Board integration owner: `apps/api/src/routers/_app.ts`.

## Safety Rule
No real customer outbound messaging is sent in MVP unless a future provider is explicitly configured and wired.

