# Visit country tracking

Deployed and production-verified on 2026-10-24. Fresh website and dashboard
visits both display Nigeria (NG) in Logly. See
`brain/handoffs/2026-10-24-country-tracking-release.md`.

## Behavior

Both public website and dashboard analytics use the same server route. The
Next adapter is upgraded from 0.2.0 to 0.2.1. A tracked Bun patch adds the
`trustCloudflareCountry` option implemented in the Logly SDK source. This
avoids requiring an unpublished SDK release. Keep the existing core 0.2.0
IndexedDB patch; remove the Next patch after a released adapter includes it.

On Vercel, the adapter prefers `cf-ipcountry` when the route explicitly trusts
Cloudflare and either that header or `cf-ray` is present. Missing/invalid
Cloudflare location stays unknown rather than attributing the proxy's Vercel
location. Direct Vercel requests use `x-vercel-ip-country`. Other runtimes do
not trust these headers. Codes are normalized and bounded before forwarding;
Logly's existing ISO whitelist validates them before persistence.

The deployment must supply/overwrite Cloudflare visitor headers at its trusted
ingress. This is approximate delivery-network geography, not residence or a
permission signal. The browser's body country and `x-logly-country` cannot
override this policy. No IP/GPS/city or browser location prompt is introduced.

Logly's existing nullable country column, first-write deduplication and
complete-window Insights map/list are reused. Its Events table and event
details now expose flag, name/code, and Unknown. Historical visits remain
unknown; there is no backfill or schema migration.

## Verification

- `bun --env-file=/dev/null test packages/events/src`: 12 pass.
- `bun run --filter @afterservice/events typecheck`: pass.
- `bun run smoke:logly:country`: actual shared Afterservice POST handler to local
  authenticated Logly collector, PostgreSQL, detail reads and country summary;
  NG wins over US, retry from GB retains NG, missing CF stays null, body FR
  override ignored. The fixture uses only a `.localhost` collector and models
  Vercel in its isolated process; it does not change dev-server configuration.
- Logly country SQL fixture: 100 NG + 100 US + 50 GB + 1 unknown, with retries,
  project/time/source boundaries and existing acquisition/funnel regression.
- All 96 Logly tests, workspace typecheck and production build pass.
- Chrome desktop and 390px mobile: visit column/details, saved column order,
  Insights counts/selection and unknown total verified; no console errors or
  page overflow.
- Final full Afterservice workspace typecheck passes (13 tasks).

## Rollout

Website, dashboard and Logly are deployed and verified on their canonical
production domains. Fresh real browser visits at `/` and `/sign-in` both
recorded Nigeria (NG). Historical visits remain unknown. Exact deployment IDs,
isolated release validation and screenshots are in
`brain/handoffs/2026-10-24-country-tracking-release.md`. No npm publication or
database migration was required.
