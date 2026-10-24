# Feature: Operations Assistant

Date: 2026-10-24
Status: proposed; implementation not started
Phase: post-MVP operator workflow improvement
Owner: product/engineering

## Purpose

Let operators use an Ewatrade-style assistant to find work, prepare validated
changes, review them and save through afterservice's normal domain operations.

Canonical scope, references, proposed architecture, delivery sequence and tests:
[Operations assistant integration plan](../plans/2026-10-24-feature-operations-assistant.md).

## Proposed First Release

- Persistent dashboard chat and dedicated assistant page, including mobile fit.
- Actor-private saved conversations, streaming, stop/retry and run recovery.
- Customer and completed-job search/history and reviewed create/edit actions.
- Follow-up creation, rescheduling, assignment, contact/reply logging and closure.
- Editable check-in, review-request, issue-resolution, repeat-service and referral
  copy; template creation/editing/archiving/defaults.
- Today's workload and deterministic basic operational reports.
- Onboarding/product help, reviewed owner/admin settings changes and billing
  explanations/navigation.
- Usage allowance, feature flags, capability coverage and saved action receipts.

## Behavior Rules

Business writes require an exact editable proposal and an explicit confirmation
of its current revision. Use canonical permissions/limits and transactional,
idempotent execution. Read/draft tools never give the model write authority.
Operator timezone, exact monetary conversion, target disambiguation, scope
revocation and normal dashboard cache refresh are required.

Email begins as drafting plus the existing send-form handoff. Direct assistant
dispatch requires the plan's durable-send and provider acceptance gate. Phone
contact logging records an action already performed by the operator. Scheduled
follow-ups remain manual board tasks.

## Deferred

Voice, file import, linked operator WhatsApp, public website help, autonomous
outreach and team administration. No commerce/accounting/payment feature is
introduced by copying the Ewatrade interaction pattern.

## Acceptance

- [ ] Every first-release capability has a canonical operation and role policy.
- [ ] Actor/workspace isolation and permission revalidation pass.
- [ ] Draft/edit/cancel/confirm/receipt/reload flows pass without duplicate writes.
- [ ] Complete customer/job/follow-up workflow agrees with the ordinary dashboard.
- [ ] Desktop/mobile viewport, accessibility, failure and quota states pass.
- [ ] Provider-free and controlled real-model evaluations pass.
- [ ] Brain API/database/architecture/testing documents reflect implemented scope.

No assistant code, provider configuration, schema migration or activation is
part of this planning deliverable.
