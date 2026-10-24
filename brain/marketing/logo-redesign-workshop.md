# Logo Redesign Workshop

Date: 2026-10-24
Status: Option 01 version 2 selected by the user and implemented locally.

## Brief

Explore three materially different identities for afterservice while retaining
the lowercase name, practical operator audience, and “The care continues” promise.
Keep ink, teal, and warm paper as the shared comparison palette.

The concepts were generated with `claude-opus-5-5` at `high` effort through the
installed Claude CLI. The returned usage metadata confirms the canonical model.
Codex assembled the comparison boards and lowered direction 01's right stem
after rendered review so the mark reads as lowercase a rather than d.

## Review

Permanent comparison: https://workshop.localhost/after-service/brand/logo-redesign

| Direction | Intent | Current revision |
| --- | --- | --- |
| 01 Follow-through a | Evolve the existing lowercase a; a forward tail and teal dot suggest the next check-in. Recommended starting point. | v2: `1b22b7bd-d5bb-4125-8988-7537bcc38b85` |
| 02 Turned Corner | A solid job-card silhouette with a detached teal corner; strongest compact icon. | v1: `5f2f178f-83a9-4960-a534-d3c12ab97328` |
| 03 Extended Crossbar | An ft ligature with a continuing dash and serif wordmark; more editorial and expressive. | v1: `a8f4dab3-eb1e-4c96-9414-1350cae61a07` |

Each archived board includes primary/reversed lockups, an app icon, a website
header sample, 16/24/32px marks, and working color/monochrome controls. Fonts and
SVG assets are bundled. Unavailable optional font families fall back to bundled
Inter or system Georgia; these are concept typography choices, not outlined
production wordmarks.

Source and generation evidence live in the shared Workshop application:
`/Users/M1PRO/Documents/code/workshop/work/after-service/brand/logo-redesign/`.
The catalog preserves the original direction 01 revision alongside the refinement.

## Decision Boundary

The user selected option 01 and explicitly requested implementation across the
website, dashboard, and app icons. Its exact v2 revision was selected in Workshop
before editing product source. The shared logo, compact marks, social image,
favicons, Apple icons, and PWA assets now use that identity locally. Production
deployment is not included. ADR 0021 and `brain/features/brand-identity.md` record
the implementation and verification boundaries.

## Verification

Published gallery and all three archived direction pages rendered in the in-app
browser. Inspected the reversed, app-icon, and small-size applications; tested
color/monochrome switching. Rechecked direction 01's refined lowercase geometry.
The initial exploration had no product runtime changes. The subsequent selected
implementation passes the full typecheck, both optimized app builds, desktop
and 390×844 website/dashboard logo checks, icon metadata/dimension/safe-area
validation, and the PWA runtime contract. Temporary local QA access was revoked
and its isolated fixture removed. See `brain/features/brand-identity.md` for the
verification record. API, authentication, database, and permission contracts
are unaffected.
