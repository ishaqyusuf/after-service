# 0017. Resolve pricing from visitor country

Date: 2026-10-24

## Context

The marketing pricing page could show GBP outside the UK. The shared resolver
preferred custom/Vercel headers over Cloudflare's visitor country and inferred
currency from browser language when country mapping failed. Vercel can locate
an upstream Cloudflare proxy instead of the visitor. A known unsupported
country could also fall through to a language or Europe-wide EUR guess.

## Decision

- Keep currency resolution in `@afterservice/plans`, shared by website and
  dashboard billing previews.
- Prefer `cf-ipcountry` when Cloudflare headers are present. If `cf-ray` is
  present without a usable country, use the unknown-country USD fallback;
  never use Vercel's proxy location in that case.
- Otherwise use `x-vercel-ip-country`, then the existing custom
  `x-user-country` hint for local/support use.
- Resolve NG/GB/US/CA and the existing supported eurozone country table to
  NGN/GBP/USD/CAD/EUR. Known unsupported countries use USD with a fallback note.
- Browser language, route language, and continent do not establish billing
  currency. Missing/invalid countries use USD without claiming a US location.
- Keep explicit website `region`/`currency` query overrides for support/QA.
- Keep the existing fixed conversion table, planned-price disclosures, free
  beta gate, Polar catalog, and webhook-only entitlement updates.

## Consequences

Production Cloudflare must enable IP Geolocation or the Add visitor location
headers Managed Transform. Missing configuration safely shows USD. Local
development has no automatic IP country; support overrides or request-header
fixtures are required for country-specific previews. IP detection can reflect
a VPN location.

Polar is connected in code, but this change does not configure provider prices,
enable paid checkout, or establish that displayed estimates equal provider
charges. Customer-IP forwarding and sandbox currency acceptance remain in the
regional pricing plan's paid-launch work.

## References

- [Vercel proxy geolocation limitation](https://vercel.com/kb/guide/can-i-use-a-proxy-on-top-of-my-vercel-deployment)
- [Cloudflare IP geolocation configuration](https://developers.cloudflare.com/network/ip-geolocation/)
- [Polar checkout API](https://polar.sh/docs/api-reference/checkouts/create-session)
