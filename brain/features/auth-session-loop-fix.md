# Feature: Auth Session Loop Fix

## Status
Implemented and verified on 2026-05-30.

## Problem
Signing in could redirect back to `/sign-in` even after Better Auth created a valid session. The dashboard proxy only recognized non-secure cookie names, while local env could make Better Auth emit `__Secure-better-auth.session_token`.

## Fix
- Password recovery now has exact anonymous page access and a complete typed
  request/token-reset flow. See `brain/features/password-recovery.md` for
  delivery rules, session revocation, acceptance and rollout status.
- Dashboard auth endpoints are mounted same-origin at `/api/auth/**`.
- Dashboard sign-in/sign-up call same-origin auth routes.
- Proxy session detection accepts secure-prefixed Better Auth cookie names.
- Local auth base URL defaults to `http://localhost:4101` so production API URLs in `.env` do not force secure cookies during local development.

## 2026-10-18 Browser Regression Hardening

- Auth pages perform a real server session/workspace lookup before redirecting
  signed-in users. The proxy keeps its fast cookie-presence gate for protected
  routes, but no longer bounces stale/forged cookies away from sign-in.
- A shared safe return-path helper rejects absolute, protocol-relative,
  backslash, and whitespace/control-character destinations. Auth pages avoid
  redirecting existing sessions back to themselves.
- The sign-in page supplies the validated return path from the server, so a
  fast submit cannot race a client effect and unexpectedly navigate home.
- Exact HTTPS Portless website/dashboard origins are trusted alongside the
  existing HTTP development origins.
- Website auth redirects derive host/protocol from the incoming proxy headers,
  so HTTPS Portless signup/login no longer point to the internal HTTP listener.
- Each Next.js app allows its exact Portless hostname for development assets
  and diagnostics, including WebKit's stack-frame requests.
- Playwright exercises signup, onboarding, persisted sessions, sign-in, real
  sign-out, invalid credentials, stale cookies, and safe redirects. See
  `brain/engineering/testing.md` for the full browser matrix and commands.

## Verification
Local HTTP smoke with a disposable account:
- `POST /api/auth/sign-up/email` returned `200` and set a session cookie.
- `POST /api/onboarding` returned `200`.
- `GET /` with the same cookie returned `200` instead of `307 /sign-in?return_to=/`.


## QA Cookie Base URL Alignment — 2026-10-19

Ordinary auth and QA session cookie signing now share `getAuthBaseUrl`. Local
mode uses the local override/default even when a public production URL is set,
so the derived cookie prefix matches the active auth instance. Production and
production-built preview URL behavior is preserved. Regression tests cover the
local/public mismatch, HTTPS override, and real API session context.
