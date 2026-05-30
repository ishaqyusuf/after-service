# Feature: Billing And Entitlements MVP

## Status
Implemented foundation for MVP on 2026-05-30.

## Scope
- Billing page displays plan, status, usage, limits, and checkout action.
- `billing.getCurrentPlan`, `billing.createCheckout`, and `billing.getPortalUrl` tRPC procedures.
- Lemon Squeezy webhook signature verification.
- Idempotent `BillingEvent` storage.
- Subscription and workspace plan/status updates from verified webhooks.
- Starter/Growth/Pro limits for customers, follow-ups, templates, and team members.

## Architecture
- API owner: `apps/api/src/routers/_app.ts` `billing` router.
- Webhook owner: `apps/api/src/index.ts`.
- UI owner: `apps/dashboard/src/app/billing/page.tsx`.

## Rules
- Entitlement truth comes from verified Lemon Squeezy webhooks.
- Checkout redirects are not trusted as entitlement state.
- Owner/admin access is required for checkout and portal actions.

## Limits
- Starter: 100 customers, 200 follow-ups, 5 templates, 1 team member.
- Growth: 1,000 customers, 3,000 follow-ups, 25 templates, 5 team members.
- Pro: 10,000 customers, 25,000 follow-ups, 100 templates, 25 team members.

