# Feature: Follow-Up Board MVP

## Status
Implemented for MVP on 2026-05-30.

## Scope
- Board columns: Due Today, Upcoming, Waiting, Replied, Closed.
- Table view of follow-ups.
- Board-level empty state that opens the create follow-up sheet when no follow-ups exist.
- Board cards and columns use the typed `followUps.listBoard` router output in the dashboard component.
- Create, update, reschedule, assign owner, mark sent, mark replied, and close actions.
- Timeline events for state changes.
- Manual-send logging creates `MessageLog` rows.

## Architecture
- API owner: `apps/api/src/routers/_app.ts` `followUps` router.
- UI owner: `apps/dashboard/src/app/follow-ups/page.tsx`.
- Events are persisted as `FollowUpEvent`.
- Manual outreach is persisted as `MessageLog`.

## Messaging Rule
Customer outreach is operator-initiated. Explicit manual email sends use the
queued delivery path documented in `brain/features/notifications-mvp.md`.
Phone logging records contact locally without provider dispatch; no automatic
customer messaging is added by the browser/edge-case hardening work.

## Verification

Updated 2026-10-18:
- Both creation entrypoints validate template ownership. Direct creation also
  validates the related job's workspace/customer; updates validate template
  ownership and assignments require an active-workspace membership ID.
- Manual phone logging atomically persists sent status, a phone message log,
  and a timeline event without provider dispatch.
- Real-database integration tests cover isolation, permissions, limits, state
  transitions, cadence, and audit records. Playwright covers direct/inline
  creation, job scheduling, calendar rescheduling, phone logging, replies,
  closure, and board/history refreshes. See `brain/engineering/testing.md`.

- `bun run typecheck`
- `bun run lint`
- `bun run build`
- Local HTTP smoke verified sign-up, onboarding, and authenticated dashboard access.

## Operator Calendar And Exclusive Stages (2026-10-19)

Board and overview queries accept an optional validated IANA `timeZone`, default
UTC for existing API callers. The dashboard hydrates with UTC, then uses a distinct
browser-timezone query key so cached UTC grouping cannot mask local dates.
Calendar days are compared in that timezone, including DST and UTC date changes.
Scheduled/open/missed work due today or earlier appears under Due today; future
work appears Upcoming. Sent work appears only in Waiting, with replied/closed in
their own columns. Overview due/overdue/upcoming counts exclude sent work.
The board's Due today column intentionally includes overdue work; overview
metrics show due today and overdue separately.

Regression coverage includes Lagos local midnight, western timezones, repeated
DST hours, year boundaries, invalid zones, and exclusive sent-state membership.


## Work Form Error Feedback — 2026-10-19

Reschedule, manual-send logging, reply, and close mutations now surface server
rejections through the corresponding form field's error message. The deployed
preview shows the QA external-effect denial beneath Recipient; no sent-state,
message-log, or timeline event is written on denial. This change is verified
in Preview; the latest form changes still need Production promotion.
