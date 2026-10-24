# API Permissions

## Private portfolio reads

Oversight requires an explicit enabled flag and separate server-only bearer key
of at least 32 characters. It never accepts browser/workspace auth as portfolio
authority. The dedicated read database connection has no application URL
fallback. No write endpoint, campaign or suspension capability is exposed.

## Purpose
This file defines authorization rules.

## Roles
- `owner`: full workspace access, billing, team management.
- `admin`: operational access and team management, no ownership transfer.
- `staff`: operational access to assigned/visible customers, jobs, follow-ups.

## Public Routes
- Website pages.
- Sign-up/sign-in pages.
- Exact forgot-password and reset-password pages (including supported locales).
- Recovery requests need no session; password changes require a valid, unexpired,
  one-use Better Auth reset token. Callback origins remain validated, including
  in integration tests. Successful resets revoke the account's sessions.
- API health.
- Lemon Squeezy webhook endpoint with signature verification.
- Internal QA capability and credential exchange routes exist only in enabled
  non-production build artifacts; they are not production public routes.

## Internal Routes
- `POST /api/jobs/follow-ups/dry-run` requires `CRON_SECRET` through a bearer token or `x-cron-secret` header.
- `GET /api/jobs/follow-ups/mark-missed` uses the same secret. Its clock and
  all-workspace housekeeping scope are server-owned; request overrides are rejected.
- Internal job routes do not use browser session auth and must not accept untrusted customer-facing side effects.

## Authenticated Routes
- Workspace onboarding.
- Dashboard session.

## Workspace Routes
Require active membership:
- Customers
- Service jobs
- Follow-ups
- Templates
- Settings

## Owner/Admin Routes
- Billing checkout creation.
- Billing portal access.
- Team invites.
- Workspace-level settings.

## Enforcement Rules
- Never trust workspace ID from the client without membership lookup.
- Permission checks must run in API procedures.
- UI gates are helpful but not security boundaries.
- QA profile discovery requires an active digest-backed authorization and may
  return only workspaces whose explicit QA source domain matches the grant.
- QA-derived sessions are ordinary Better Auth sessions but remain bound to one
  active authorization, membership, and workspace on every server context.
- QA-derived sessions never inherit the selected identity's global
  `platform_admin` authority; platform QA maintenance requires a separately
  authenticated normal administrator session.
- QA workspaces may send only exactly routed QA email. SMS, phone, WhatsApp,
  payment, subscription, and destructive effects fail closed before provider
  invocation unless an approved QA adapter exists.

## Auth Proxy Behavior
- Standalone API:
  - Production host: `https://api.afterservice.app`.
  - Exact trusted-origin CORS applies to both tRPC mounts and API routes; unknown origins are not reflected.
  - Existing server-side session, workspace membership, cron secret, and webhook signature checks are unchanged.
  - Keep the production auth signing secret consistent across API and Next.js deployments.
- Browser OAuth:
  - Google sign-up/sign-in starts from the dashboard origin and must use `BETTER_AUTH_URL=https://dash.afterservice.app` in production.
  - The authorized Google redirect URI is `https://dash.afterservice.app/api/auth/callback/google`.
  - Keep OAuth session cookies scoped to the dashboard origin; API routes may validate sessions but must not be the browser OAuth callback origin.
- Dashboard proxy:
  - Public routes: `/sign-in`, `/sign-up`, `/onboarding`, `/api/`, `/_next/`, `/favicon`.
  - Uses cookie presence for redirect gating.
  - Accepted session cookie names: `better-auth.session_token`, `__Secure-better-auth.session_token`, `__Host-better-auth.session_token`, `better-auth-session_token`, and `afterservice.session_token`.
  - Auth pages validate the real server-side session before redirecting signed-in
    users to a safe `return_to` or `/`; cookie presence alone never redirects away
    from sign-in. Users with a valid session but no workspace go to onboarding.
  - Unauthenticated users on protected routes are redirected to `/sign-in` with `return_to`.
  - Full session validation still happens in Better Auth/server code; proxy gating is only a fast redirect guard.
- Website proxy:
  - `/login` and `/sign-in` redirect to dashboard `/sign-in`.
  - `/signup` and `/sign-up` redirect to dashboard `/sign-up`.
  - Uses `buildDashboardUrl` from `@afterservice/utils` for correct host resolution.
- Trusted origins:
  - Local: `http://localhost:4100`, `http://localhost:4101`, `http://127.0.0.1:4100`, `http://127.0.0.1:4101`.
  - Portless: `http://afterservice.localhost:1355`, `http://app-afterservice.localhost:1355`, `https://afterservice.localhost`, `https://app-afterservice.localhost`.
  - Env-provided: `BETTER_AUTH_TRUSTED_ORIGINS`, `AUTH_TRUSTED_ORIGINS` (comma-separated).
- Safe redirect validation:
  - Only allow same-origin relative paths beginning with `/`.
  - Reject `//evil.com`, absolute URLs, and backslash variants.
  - The shared return-path helper also rejects whitespace/control characters.

## Follow-Up Relationship Validation

- Both follow-up creation paths and follow-up updates reject templates outside
  the session workspace before writing.
- An optional related job must belong to the active workspace and the selected
  customer.
- Assignment accepts only a membership ID in the active workspace, or `null`
  to unassign. Missing/foreign relations return `NOT_FOUND` without disclosing
  the referenced record.
- HTTPS Portless origins `https://afterservice.localhost` and
  `https://app-afterservice.localhost` are exact trusted origins alongside the
  existing HTTP development origins; no hostname wildcard is added.
# QA maintenance

- Only users whose global `platformRole` is `platform_admin` may discover,
  adopt, preview, start, or poll QA purge runs.
- Workspace owner/admin roles do not grant platform maintenance authority.

## Assistant Access — 2026-10-24

Every private assistant operation revalidates membership and actor/workspace
conversation ownership. Owner/admin settings rules remain canonical and current
roles are reread inside confirmation transactions. Staff operational access
matches existing workspace-scoped domain policy; assignment-only visibility is
not implemented or claimed. Feature/workspace/capability rollout never expands
authority. Exact-origin guards protect browser mutations and streaming. No model
receives billing writes, team-role changes, platform maintenance or secrets.
