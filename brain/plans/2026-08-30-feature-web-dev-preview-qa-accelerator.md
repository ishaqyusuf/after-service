# Plan: Web Development And Preview QA Accelerator

## Type

Feature

## Status

Implemented — rollout and deployed-preview acceptance pending

## Created Date

2026-08-30

## Objective

Port the shared Halaalvest/EwaTrade QA accelerator into afterservice's web-only
architecture. Authorized testers should validate an exact QA Domain with a
separate tester credential, choose an eligible QA workspace profile, enter
through an ordinary Better Auth session, and Quick Fill eligible forms with
safe domain-bound synthetic drafts. Production and ordinary manual workflows
must expose no usable accelerator capability.

## Existing Foundation

- `EMAIL_QA_DOMAIN_ROUTES` routes configured `.test` domains while preserving
  the synthetic application identity.
- `Workspace` stores explicit QA classification, source domain, and purge state.
- Platform-admin QA maintenance previews and purges marked workspaces.
- Dashboard auth, onboarding, customer, job, follow-up, template, and settings
  forms already have partial development Quick Fill helpers.

## Non-Negotiable Rules

- Only server-private local, development, or preview configuration can enable
  the accelerator. Client flags, query parameters, headers, or cookies cannot.
- QA Domain and tester credential are separate. Persist only credential/token
  digests and discard raw credential material after exchange.
- Profile entry revalidates the current User, Membership, Workspace, role,
  subscription, QA classification, and purge state before creating an ordinary
  Better Auth session.
- Quick Fill changes form state only. It never submits, sends, checks out,
  archives, purges, or invokes another mutation.
- Every generated email uses the authorized QA Domain. Other values must be
  recognizable and non-contactable.
- Routed QA email may be delivered. SMS, WhatsApp, payment, subscription,
  destructive, and other irreversible effects fail closed for QA workspaces
  unless a separately approved test adapter or canary exists.
- Passwords, OAuth secrets, reset tokens, tester credentials, provider keys,
  and destructive confirmations are never generated or filled.

## Implementation Batch

1. Adopt the shared local-infra profile and four-mode environment contract.
2. Attach QA tooling only to authorized non-production environments.
3. Authorize an exact QA Domain with a digest-only tester credential.
4. Discover and enter an eligible workspace-scoped QA access profile.
5. Add an SSR-safe dashboard authorization and account chooser.
6. Enforce provider, checkout, and destructive-effect safety.
7. Introduce typed Quick Fill recipes and complete form coverage.
8. Quick-fill auth, onboarding, customer, job, follow-up, template, and safe
   workspace settings drafts.
9. Explicitly classify security-sensitive, provider-backed, and irreversible
   forms as prerequisites or exclusions.
10. Prove local/preview readiness and production absence at contract and
    artifact boundaries.

## Validation Seams

- Pure environment/capability resolution and production startup refusal.
- Credential issue, exchange, lockout, expiry, revocation, and token revalidation.
- Exact-domain workspace profile discovery and stale selection rejection.
- Better Auth session entry retains normal membership and workspace permissions.
- Effect-policy decisions occur before provider/checkout/destructive invocation.
- Fixture recipes are deterministic, schema-valid, domain-bound, and draft-only.
- Form inventories fail on missing, duplicate, or stale coverage declarations.
- Local-infra routing selects exactly one mode file and never targets production
  implicitly.

## External Release Evidence

Deployed preview canaries, multi-browser acceptance, provider delivery, and the
first operator-reviewed purge remain release-owner actions. They do not weaken
the source-level production fail-closed boundary.

## Implementation Result

All ten source tickets were implemented on 2026-08-30. afterservice now uses
the shared local-infra four-mode contract, a digest-only QA authorization
lifecycle, exact-domain workspace profiles, ordinary scoped Better Auth
sessions, provider-effect guards, deterministic QA-bound Quick Fill recipes,
and production route/module exclusion. Migration application and deployed
acceptance are tracked as rollout work rather than source implementation gaps.
