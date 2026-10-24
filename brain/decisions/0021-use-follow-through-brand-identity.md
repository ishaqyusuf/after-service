# Use The Follow-through Brand Identity

Date: 2026-10-24
Status: Accepted

## Context

The user selected logo workshop option 01, “Follow-through a,” and requested
implementation across the website, dashboard, and app icons. The accepted
revision is `1b22b7bd-d5bb-4125-8988-7537bcc38b85` (version 2).

Workshop: https://workshop.localhost/after-service/brand/logo-redesign

## Decision

Use the selected open lowercase a, forward tail, and detached teal dot. Keep
the lowercase afterservice name and use the preview's bundled Inter rendering
at weight 600 with -0.02em tracking for the shared wordmark. Scope its local
font to the logo so dashboard typography remains unchanged.

Keep geometry and brand colors in `packages/ui/src/brand.ts`. Both the shared
`BrandMark` component and the repeatable `bun run brand:icons` generator read
that source. Existing logo APIs delegate to the shared mark, including dashboard
sidebar, mobile menu, search footer, and website social-preview usage.

Generate browser SVG/ICO favicons, 180px Apple touch icons for both apps, and
192px/512px normal plus 512px maskable PWA icons for the website. SVG favicons
adapt their ink to the browser's light/dark preference. Install icons use an
opaque warm-paper background and a 75% mark within the maskable safe circle.
Advance the website service-worker cache to v3 to refresh cached brand assets.

## Consequences

- Logo changes no longer require editing independent inline SVG geometries.
- The existing manual-first marketing story and application behavior remain.
- Dashboard installation capabilities are unchanged; this adds its touch icon,
  not a new manifest or service worker.
- Builds and local runtime checks establish source readiness, not deployment
  or replacement of icons already installed by an operating system.
