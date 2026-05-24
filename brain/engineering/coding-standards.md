# Coding Standards

## Purpose
This file records implementation standards for afterservice.

## TypeScript
- Keep `strict` mode on.
- Prefer explicit domain types at API/package boundaries.
- Avoid `any`; use typed schemas or discriminated unions.
- Keep imports stable and package-scoped when crossing workspace boundaries.

## React And Next.js
- Use server components by default.
- Use client components only for interactivity.
- Keep dashboard views dense, practical, and accessible.
- Avoid marketing-style sections inside operational dashboard surfaces.

## API
- Validate external input with schemas.
- Enforce session and workspace permissions server-side.
- Return typed errors with clear messages.
- Keep tRPC routers grouped by domain.

## Database
- Every business record must be workspace-scoped unless explicitly global.
- Prefer soft archive/delete for customer-facing records.
- Add indexes for workspace filters, due-date queries, and provider refs.
- Migrations must be deterministic.

## Billing
- Checkout starts in API.
- Entitlements update only from verified Lemon Squeezy webhooks.
- Billing events must be idempotent.

## Naming
- Product name: `afterservice`.
- Package namespace: `@afterservice/*`.
- Do not introduce earlier placeholder names.
