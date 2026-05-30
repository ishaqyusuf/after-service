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

## Midday Architecture Patterns
- Midday is the primary implementation standard for pages, tables, modals, sheets, sidebar, forms, onboarding, layouts, tRPC calls, loading states, error states, and caching patterns.
- Pages, tables, modals, sheets, forms, onboarding, sidebar, sign-out, and shared dashboard components must follow Midday architecture, file naming, and coding patterns.
- Tables should use a shared core plus domain folders:
  - `components/tables/core`
  - `components/tables/<domain>/columns.tsx`
  - `components/tables/<domain>/data-table.tsx`
  - `components/tables/<domain>/table-header.tsx`
  - `components/tables/<domain>/skeleton.tsx`
  - `components/tables/<domain>/empty-states.tsx`
  - `components/tables/<domain>/bottom-bar.tsx` when needed
  - `components/tables/<domain>/action-menu.tsx` when needed
- Sheets should use:
  - `components/sheets/global-sheets.tsx`
  - `components/sheets/global-sheets-provider.tsx`
  - `components/sheets/...`
- Forms must follow Midday validation, error handling, and mutation patterns.
- Data fetching and mutations must use standard Midday tRPC patterns, including invalidation, loading states, errors, and caching behavior.
- Use shadcn standard components and patterns. Never directly modify shadcn source components; create wrapper components for project-specific behavior.
- Use GND as the reference for the standard notification package system.
- Use Plot Keys as the reference for local URL handling, Portless/proxy support, and generated links.

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

## Runtime URLs
- Never hardcode app origins in components or pages.
- Use `buildSiteUrl`, `buildDashboardUrl`, `buildApiUrl` from `@afterservice/utils` for cross-app URL construction.
- Pass `window.location.origin` at the edge (client) or request headers/host/protocol (server) into URL helpers.
- The runtime URL library handles localhost, Portless, and production host resolution.
- Proxy-relative dashboard routes (same-app links like `/sign-in`) are preferred when inside dashboard.

## Auth Proxy
- The dashboard proxy protects authenticated routes via cookie presence gating.
- Full session validation happens inside server components / API routes via Better Auth.
- The website proxy redirects `/login` and `/signup` to the dashboard sign-in/sign-up pages.
- Use safe `return_to` validation: only allow same-origin relative paths starting with `/`.
- Dev quick-fill components must never render in production builds.
