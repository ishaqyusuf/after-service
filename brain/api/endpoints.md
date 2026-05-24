# API Endpoints

## Purpose
This file tracks planned HTTP and tRPC endpoints.

## HTTP
- `GET /health`: service health.
- `POST /webhooks/lemon-squeezy`: Lemon Squeezy webhook receiver.
- `/api/auth/**`: auth handler once auth is implemented.

## tRPC Routers
`health`
- `health`: returns service status.

`workspace`
- `getCurrent`
- `completeOnboarding`
- `updateSettings`

`customers`
- `list`
- `get`
- `create`
- `update`
- `archive`

`serviceJobs`
- `list`
- `get`
- `create`
- `update`
- `markCompleted`
- `createFollowUp`

`followUps`
- `listBoard`
- `listTable`
- `create`
- `update`
- `reschedule`
- `assignOwner`
- `markSent`
- `markReplied`
- `close`

`templates`
- `list`
- `create`
- `update`
- `archive`
- `setDefault`

`billing`
- `getCurrentPlan`
- `createCheckout`
- `getPortalUrl`

## Endpoint Rules
- Mutations require auth unless explicitly public.
- Workspace routes require active workspace membership.
- Billing webhooks use signature verification, not session auth.
