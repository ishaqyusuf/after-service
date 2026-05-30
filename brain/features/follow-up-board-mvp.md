# Feature: Follow-Up Board MVP

## Status
Implemented for MVP on 2026-05-30.

## Scope
- Board columns: Due Today, Upcoming, Waiting, Replied, Closed.
- Table view of follow-ups.
- Create, update, reschedule, assign owner, mark sent, mark replied, and close actions.
- Timeline events for state changes.
- Manual-send logging creates `MessageLog` rows.

## Architecture
- API owner: `apps/api/src/routers/_app.ts` `followUps` router.
- UI owner: `apps/dashboard/src/app/follow-ups/page.tsx`.
- Events are persisted as `FollowUpEvent`.
- Manual outreach is persisted as `MessageLog`.

## Messaging Rule
MVP is manual-send only. No real outbound email, SMS, or WhatsApp is sent from board actions.

## Verification
- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Local HTTP smoke verified sign-up, onboarding, and authenticated dashboard access.

