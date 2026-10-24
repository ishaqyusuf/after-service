# 03 — Authorize a QA Domain with a tester credential

**Status:** implemented — database rollout pending

**Blocked by:** 02 — Attach QA tooling to authorized non-production environments.

Let a platform admin issue a one-time-visible credential for an exact configured
QA Domain. Exchange it for a bounded HttpOnly authorization with digest-only
storage, throttling/lockout, expiry, revocation, redacted errors, and no raw
credential leakage.
