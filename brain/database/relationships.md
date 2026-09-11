# Database Relationships

## Purpose
This file documents intended entity relationships.

## Workspace
- A `Workspace` has many `Memberships`.
- A `Workspace` has many `Customers`.
- A `Workspace` has many `ServiceJobs`.
- A `Workspace` has many `FollowUps`.
- A `Workspace` has many `FollowUpTemplates`.
- A `Workspace` has one active `Subscription` conceptually, though historical subscription records may exist.

## User And Membership
- A `User` can belong to many workspaces through `Membership`.
- A `Membership` belongs to one `Workspace` and one `User`.
- A `TeamInvite` belongs to one `Workspace` and may become a `Membership`.

## Customer And Service Work
- A `Customer` belongs to one `Workspace`.
- A `Customer` has many `ServiceJobs`.
- A `Customer` has many `FollowUps`.

## Follow-Up
- A `FollowUp` belongs to one `Workspace`.
- A `FollowUp` belongs to one `Customer`.
- A `FollowUp` may belong to one `ServiceJob`.
- A `FollowUp` may reference one `FollowUpTemplate`.
- A `FollowUp` has many `FollowUpEvents`.
- A `FollowUp` has many `MessageLogs`.

## Billing
- A `Subscription` belongs to one `Workspace`.
- A `BillingEvent` records provider webhook payloads and links to a workspace when resolvable.

## Invariants
- Business objects cannot cross workspaces.
- Follow-up ownership is optional at first but must reference a membership when assigned.
- Provider event IDs must be unique for idempotency.
- One `QaTesterGrant` has many `QaClientAuthorization` records and audit events.
- One `QaClientAuthorization` has many profile selections, derived sessions,
  and audit events.
- A QA-derived `Session` belongs to one authorization and stores the exact
  membership/workspace scope revalidated by request context.
- Revoking a grant or authorization deletes all derived sessions; consuming a
  profile reference cannot be replayed.
# QA cleanup boundary

- The QA marker belongs to the workspace aggregate root and covers memberships,
  customers, jobs, follow-ups, templates, messages, and subscriptions.
- `QaPurgeRun` has no workspace relation so the counts-only receipt survives.
