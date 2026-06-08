# Bug: Google Sign-Up Failed Inline

## Status
Code fix implemented on 2026-06-08. Production retry still depends on deployment and TLS health.

## Symptom
Clicking "Sign up with Google" on the dashboard sign-up page stays on the page and shows the generic Google sign-up failure message instead of redirecting to Google.

## Diagnosis
- The failure occurs before the browser leaves the sign-up page, so the failing path is OAuth initiation at `/api/auth/sign-in/social`.
- Production browser OAuth must use the dashboard origin for both initiation and callback: `https://dashboard.afterservice.app/api/auth/callback/google`.
- Live HTTP probing from the debugging environment returned Cloudflare `525 SSL handshake failed` for dashboard/API auth checks. If the same occurs for users, this is an infrastructure TLS/origin issue rather than a React form issue.
- The workspace env wrapper was vulnerable to Bun's automatic `.env` loading: `bun scripts/with-workspace-env.mjs --mode production` could let `.env` values override `.env.production` values before spawning the real command.

## Fix Notes
- The dashboard Better Auth client now uses Better Auth's same-origin browser default instead of a compiled public URL.
- Google sign-up/sign-in requests now ask for a non-auto-redirect response and redirect manually after receiving the provider URL.
- Production env validation now requires Google OAuth credentials and an explicit `BETTER_AUTH_URL` matching `NEXT_PUBLIC_DASHBOARD_URL`.
- The env wrapper now drops auto-loaded `.env` values when another mode file provides a different value for the same key, while preserving external deployment secrets.

## Verification
- `bun --filter @afterservice/dashboard typecheck` passed.
- `bun --filter @afterservice/auth typecheck` passed.
- `bun --filter @afterservice/utils typecheck` passed.
- `bun scripts/with-workspace-env.mjs --mode production -- bun -e ...` now resolves both `NEXT_PUBLIC_DASHBOARD_URL` and `BETTER_AUTH_URL` to `https://dashboard.afterservice.app`.
- Production env validation has no auth URL mismatch. It still reports missing placeholder secrets in the local `.env.production` copy.
- Production browser retry remains pending after deployment/TLS health is confirmed.
