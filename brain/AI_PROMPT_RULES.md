# AI Prompt Rules

## Purpose
This file captures persistent instructions for AI agents working on afterservice.

## Product Rules
- Always call the product `afterservice`.
- Use `afterservice.app` for the marketing domain.
- Use `dashboard.afterservice.app` for dashboard references.
- Use `api.afterservice.app` for API references.
- Do not use earlier placeholder names.

## Architecture Rules
- Follow the Plot Keys-style architecture, but do not copy real estate domain concepts.
- Keep marketing, dashboard, and API as separate apps.
- Put shared logic in packages only when it has at least two consumers or is a clear domain boundary.
- Enforce workspace scoping in the API/database layer, not only in UI.

## Non-Negotiable Architecture Rules
- Midday is the primary standard for pages, tables, modals, sheets, sidebar, forms, onboarding, layouts, tRPC calls, loading states, error states, and caching patterns.
- Pages, tables, modals, sheets, forms, onboarding, sidebar, sign-out, and shared dashboard components must follow Midday architecture, file naming, and coding patterns.
- Use shadcn standard components and patterns. Never directly modify shadcn source components; create wrapper components for project-specific behavior.
- Use GND as the reference for the standard notification package system.
- Use Plot Keys as the reference for local URL handling, Portless/proxy support, and generated links.
- Add `app/[...slug]/page.tsx` as a catch-all route that redirects to `/` unless this repository has an explicit documented reason to diverge.

## Implementation Rules
- Prefer typed contracts and schemas over ad hoc objects.
- Keep DB migrations deterministic and reviewed.
- Billing entitlement state must come from persisted Lemon Squeezy webhook data, not checkout redirects.
- Do not send customer messages in local/dev unless explicitly configured.

## Documentation Rules
- Update brain docs with meaningful changes.
- Add ADRs for architecture-level choices.
- Keep roadmap updates concrete and dated.
