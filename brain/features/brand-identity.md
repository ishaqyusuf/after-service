# Brand Identity

Date: 2026-10-24
Status: Implemented locally

## Behavior

- The website header/footer and dashboard authentication/expanded-sidebar
  lockups use the selected “Follow-through a” mark and a consistent local Inter
  wordmark. Normal text continues to use each app's existing typography.
- Collapsed sidebar, mobile-menu, search-footer, and shared demonstration marks
  use the same geometry through `Icons.LogoSmall` and `BrandMark`.
- The public Open Graph/Twitter image uses the shared mark with the existing
  care-continues artwork and copy.
- Both apps have SVG/ICO favicons and 180px Apple touch icons. Website PWA
  192px, 512px, and maskable icons are regenerated with an opaque warm-paper
  background. The service-worker cache version is `afterservice-shell-v3`.

## Ownership

- Geometry/colors: `packages/ui/src/brand.ts`.
- Mark rendering: `packages/ui/src/components/brand-mark.tsx`.
- Lockup/font: `packages/ui/src/components/brand-logo.tsx` and its bundled font.
- Asset generation: `bun run brand:icons`.
- Selection: ADR 0021 and workshop revision
  `1b22b7bd-d5bb-4125-8988-7537bcc38b85`.

## Verification

- Full monorepo typecheck and website/dashboard optimized builds pass.
- In-app browser inspection confirms the selected lockup on the public website
  and the dark dashboard sign-in page. Authenticated checks confirm collapsed
  and expanded sidebar marks and the mobile navigation drawer at 390×844.
  The website header also passes the 390×844 check. The rendered social image
  uses the mark.
- Both origins serve SVG/ICO/Apple icon assets with the correct content types;
  rendered metadata references those assets and HTML contains the accepted paths.
- PWA static and runtime verification passes using the trusted local Portless CA.
- Raster sizes, opaque maskable background, ICO entries, and safe-area bounds
  pass. The farthest non-background maskable pixel is 190.2px from center,
  within the 204.8px safe-circle radius at 512px.
- Scoped lint passes for new/changed logo modules, generator, and social image.
  The legacy icon registry retains pre-existing lint diagnostics; this change
  reduces them by one missing-title error and one explicit-any warning.
- The user approved local QA access after its initial automatic-review rejection.
  The existing QA origin allowlist still targets HTTP localhost, so the test
  used its configured `http://localhost:4101` origin and a new isolated local
  fixture. No allowlist or environment-file changes were needed. The temporary
  grant was revoked, derived sessions verified absent, and the exact fixture
  and temporary credential file removed after inspection.
- No API, auth, database, or permission contract changes are required. Source
  changes are included in a dedicated logo commit; no production deployment or
  push is included.
