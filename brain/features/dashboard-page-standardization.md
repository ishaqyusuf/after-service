# Feature: Dashboard Page Standardization

## Status
In progress. Page shell, form consistency, and page skeleton fallbacks updated on 2026-06-09.

## Scope
- Authenticated dashboard table pages.
- Onboarding page form.
- Shared page error handling.

## Architecture
- Route pages stay thin and compose headers, Suspense boundaries, hydrated data sections, and feature components.
- Dashboard pages use the local `apps/dashboard/src/components/error-boundary.tsx` wrapper instead of importing internal Next.js boundary modules.
- Page forms use shared `@afterservice/ui/form` primitives.

## Current State
- Customers, jobs, follow-ups, and templates pages use the local app `ErrorBoundary` with `ErrorFallback`.
- Dashboard overview, billing, settings, and onboarding pages use the same local `ErrorBoundary` with `ErrorFallback`.
- Customers, jobs, follow-ups, and templates pages use domain skeleton fallbacks for table loading.
- Follow-ups page uses a board skeleton fallback for board loading.
- Dashboard overview page uses the feature `OverviewSkeleton` instead of a raw placeholder block.
- Customers, jobs, follow-ups, and templates header controls stack on small screens and align horizontally on wider screens.
- Onboarding uses the shared form primitives and shared `Select`.
- Onboarding uses a form-shaped skeleton fallback instead of a raw placeholder block.
- Sign-in, sign-up, forgot-password, and reset-password pages use a shared centered auth shell instead of duplicated split-panel layouts.
- Sign-in, sign-up, forgot-password, and reset-password forms use shared `@afterservice/ui/form` primitives with local Zod schemas.
- Settings and billing pages already use constrained Midday-style page layouts.

## Remaining Work
- Continue auditing newly added pages against the same route composition standard.
