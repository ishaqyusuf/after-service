# Database Schema

## Purpose
This file documents the planned database schema.

## Phase 5 Implementation Target
Use Prisma with Postgres in `packages/db`.

## Auth Models
- `User`: identity record.
- `Session`: auth session.
- `Account`: provider/account link.
- `Verification`: email or token verification.

## Workspace Models
- `Workspace`: business account.
- `Membership`: user membership in workspace.
- `TeamInvite`: invite flow for team members.

## Product Models
- `Customer`: person or organization receiving service.
- `ServiceJob`: completed or tracked service work.
- `FollowUp`: after-service action tied to customer and optionally service job.
- `FollowUpTemplate`: reusable message template.
- `FollowUpEvent`: audit timeline for follow-up state changes.
- `MessageLog`: record of manual or provider-sent messages.

## Billing Models
- `Subscription`: current provider-backed plan state.
- `BillingEvent`: idempotent Lemon Squeezy webhook event log.

## Planned Enums
- `WorkspacePlan`: `starter | growth | pro`
- `WorkspacePlanStatus`: `trialing | active | past_due | canceled`
- `MembershipRole`: `owner | admin | staff`
- `ServiceJobStatus`: `completed | needs_follow_up | resolved`
- `FollowUpStatus`: `open | scheduled | sent | replied | closed | missed`
- `FollowUpChannel`: `email | sms | phone | whatsapp`
- `BillingProvider`: `lemon_squeezy`

## Index Requirements
- Workspace foreign keys on all business tables.
- Customer search fields.
- Service job completion date.
- Follow-up due date and status.
- Lemon Squeezy event ID/provider refs.
