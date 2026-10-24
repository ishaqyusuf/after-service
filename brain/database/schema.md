# Database Schema

## Purpose
This file documents the implemented Prisma/Postgres schema in `packages/db`.

## Auth Models
- `User`: Better Auth identity record.
- `Session`: Better Auth session. QA-derived sessions additionally bind the
  issuing authorization, membership, and workspace.
- `Account`: provider/account link.
- `Verification`: email or token verification.

## Workspace Models
- `Workspace`: business account, default follow-up cadence, and current entitlement plan/status.
- `Membership`: user membership in workspace with role.
- `TeamInvite`: invite flow for future team seats.

## Product Models
- `Customer`: workspace-scoped customer/contact record.
- `ServiceJob`: completed or tracked service work tied to a customer.
- `FollowUp`: after-service action tied to a customer and optionally a service job.
- `FollowUpTemplate`: reusable message template scoped to workspace and channel.
- `FollowUpEvent`: audit timeline for follow-up state changes.
- `MessageLog`: record of manual or provider-sent messages.

## Billing Models
- `Subscription`: current provider-backed plan state.
- `BillingEvent`: idempotent billing-provider webhook event log.

## QA Accelerator Models

- `QaTesterGrant`: exact QA domain, tester label, credential digest, expiry,
  status, and revocation timestamp.
- `QaClientAuthorization`: short-lived, revocable client authorization with
  client/token digests and contract version.
- `QaAccessProfileSelection`: short-lived single-use reference binding one
  authorization to an eligible membership and workspace.
- `QaAccessAttemptBucket`: atomic failed-exchange counter and timed lock.
- `QaAccessAuditEvent`: redacted authorization lifecycle audit record.
- `QaPurgeRun`: aggregate-only receipt for QA workspace cleanup.

## Enums
- `WorkspacePlan`: `starter | growth | pro`
- `WorkspacePlanStatus`: `trialing | active | past_due | canceled`
- `MembershipRole`: `owner | admin | staff`
- `ServiceJobStatus`: `completed | needs_follow_up | resolved`
- `FollowUpStatus`: `open | scheduled | sent | replied | closed | missed`
- `FollowUpChannel`: `email | sms | phone | whatsapp`
- `BillingProvider`: `polar | stripe`

## Workspace Scoping
- Customer, job, follow-up, template, event, message, subscription, and billing-event reads/writes are scoped by workspace.
- API procedures derive workspace from session membership and do not trust client workspace IDs.
- QA-derived sessions must resolve their bound membership and workspace, whose
  QA source domain must still match the active grant.

## Index Requirements
- Workspace foreign keys on all business tables.
- Customer search fields.
- Service job completion date.
- Follow-up due date and status.
- Billing event ID/provider references.
- QA credential and authorization token digests are unique; grant/domain,
  client/platform, expiry/status, lock, selection, session, and audit lookup
  paths are indexed.

## Validation
- `bunx prisma validate` in `packages/db` passed on 2026-05-30.
- `bun run db:generate` in `packages/db` passed on 2026-05-30.
# QA workspace lifecycle

- `User.platformRole` adds the global platform-admin capability.
- `Workspace` stores QA classification, source domain, marked timestamp, and
  purge-start timestamp.
- `QaPurgeRun` is global and stores only actor, timestamps, status, aggregate
  counts, and error category.

## Operations Assistant — 2026-10-24

Additive implementation in the assistant worktree adds `AssistantConversation`,
`AssistantMessage`, `AssistantRun`, `AssistantProposal`, `AssistantActionReceipt`
and `AssistantUsage` (six models). Conversations own messages/runs/proposals;
receipts are minimal workspace/actor records with a unique proposal ID. Usage is
unique by workspace/UTC month. `ServiceJob.currency` defaults legacy records to
USD; new canonical API values support USD/NGN/GBP/EUR/CAD. Model usage, drafts and
confirmation metadata never grant access. See ADR 0024 and assistant verification.

Assistant runs persist prompt version `operations-v1`; proposals persist the
capability contract version. Version mismatch refuses confirmation. Drafts expire
after 30 minutes and running turns recover after three minutes. Chat deletion
removes content/proposals/runs, while minimal receipts retain business evidence.
See the verification record for the explicit retention policy.
