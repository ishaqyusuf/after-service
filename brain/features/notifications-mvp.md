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
- Jobs runner: `packages/jobs` follows the GND Trigger.dev package pattern for `dev` and `deploy` scripts while preserving manual-send-only messaging.
- Jobs deploy mirrors GND's Prisma packaging step: `packages/jobs/prisma.ts` refreshes `packages/jobs/src/schema.prisma` from the shared DB schema before `trigger deploy`, and `trigger.config.ts` points Trigger's Prisma build extension at that task-local schema.
- Trigger.dev project selection is env-driven: `TRIGGER_PROJECT_ID` supplies the project ref, and `TRIGGER_PROFILE` optionally selects the CLI login profile for jobs `dev`/`deploy`. If the CLI says a project ref is missing under the `default` profile, create/switch to the correct Trigger.dev profile and update the env ref rather than changing task code.

## Safety Rule
No real customer outbound messaging is sent in MVP unless a future provider is explicitly configured and wired.
