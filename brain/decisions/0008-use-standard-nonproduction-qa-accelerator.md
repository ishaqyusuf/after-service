# ADR: Use Standard Non-Production QA Accelerator

## Status

Accepted

## Context

afterservice already classified and purged QA workspaces and routed exact
`.test` email domains, but its development shortcuts filled login credentials
and generated generic random fixture identities. That did not provide a
revocable tester boundary, scoped account selection, provider safety, or a
provable production absence contract.

## Decision

Adopt the Halaalvest/EwaTrade QA accelerator architecture for afterservice's web
surface: server-owned versioned capability negotiation, separate digest-only
tester grants, short-lived client authorizations, exact-domain workspace
profiles, single-use selections, ordinary scoped Better Auth sessions,
deterministic domain-bound Quick Fill recipes, explicit form coverage, and
fail-closed external-effect policy.

Internal route files use the `.qa.ts` page extension and QA client modules have
inert production aliases, so production artifacts expose no usable capability.

The credential exchange, profile chooser, and sign-up Quick Fill context run
before an ordinary application session exists. Those internal-only surfaces use
same-origin Next route handlers with schema validation and HttpOnly cookies
instead of the protected tRPC transport. Authenticated product data and
mutations continue to use the standard tRPC patterns.

## Consequences

- Tester credentials authorize QA access but never become product identities or
  passwords.
- Existing User, Membership, Workspace, and Better Auth permission behavior is
  reused after profile selection.
- Revocation and purge invalidate derived sessions.
- Unsupported provider, billing, and destructive effects fail before external
  invocation.
- New forms must declare one recipe, prerequisite, or exclusion in the shared
  coverage inventory.

## Date

2026-08-30
