# Regional Currency Pricing Plan

Date: 2026-06-11

## Status
Phase 1 public display foundation and dashboard billing preview implemented on 2026-06-11. Do not expose paid checkout publicly until the paid pilot is intentionally enabled.

## Goal
Show afterservice paid-plan prices in a visitor's regional or country-local currency, then send the same pricing context into Polar checkout so the marketing page, dashboard billing page, and payment page do not disagree.

## Constraints
- afterservice is still free beta first. Local currency pricing should support the planned Starter, Shop, and Growth launch without implying paid plans are live today.
- Billing provider is Polar, per `brain/decisions/0002-migrate-to-polar-billing.md`.
- Entitlement truth must remain verified webhook state, not checkout redirects.
- Current public pricing data in `apps/website/src/components/landing/pricing-data.ts` is static USD text.
- Current checkout creation in `apps/api/src/routers/_app.ts` is server-side, so Polar needs the real customer IP passed into checkout creation for geolocation-based currency selection.

## Decision
Use Polar product-level multi-currency pricing as the source of charged amounts, and use a small afterservice-owned pricing presentation layer for public display.

The display layer should:
- Resolve a pricing region from an explicit query/selector, existing user preference, or request geolocation.
- Render a stable local-currency amount for known target markets.
- Fall back to USD when the region is unknown or unsupported.
- Mark converted/estimated amounts clearly until the exact Polar checkout amount can be confirmed.

The checkout layer should:
- Keep plan/product selection server-side.
- Pass `customer_ip_address` when creating Polar checkout sessions.
- Optionally pass `currency` only when the user explicitly selected a supported currency.
- Optionally pass `locale` for language, but keep currency and language as separate concerns.

## Initial Regions
Start with a controlled table rather than live FX conversion:

| Region | Currency | Pricing posture |
| --- | --- | --- |
| United States | USD | Source price: $29 / $79 / $149 |
| Canada | CAD | Rounded local price, configured in Polar |
| United Kingdom | GBP | Rounded local price, configured in Polar |
| Eurozone | EUR | Rounded local price, configured in Polar |
| Nigeria | NGN | Local price or USD fallback until Stripe/Polar acceptance is verified for target buyers |
| Other | USD | Fallback with "charged in USD" note |

Controlled tables avoid surprise daily FX movements and let afterservice price by willingness-to-pay instead of pretending all markets are pure exchange-rate equivalents.

## Implementation Phases

### Phase 1: Public Display Foundation
- Replace `price: string` in website pricing data with canonical numeric USD monthly/yearly amounts and plan IDs.
- Add a shared pricing localization module with supported currencies, country-to-currency mapping, formatted display labels, and fallback notes.
- Add middleware or server helper to read country from deployment request headers when available.
- Add a compact country/currency selector on `/pricing` and the landing pricing section for manual override.
- Persist the override in a cookie so return visits and checkout intent use the same display currency.

Implementation notes:
- `packages/plans/src/index.ts` owns the supported region table, controlled local-price table, cookie name, country/header mapping, canonical USD pricing, and `Intl.NumberFormat` formatting.
- `apps/website/src/lib/pricing-request.ts` reads request headers, pricing query params, and the persisted region cookie for server-rendered initial pricing.
- `apps/website/src/components/landing/pricing.tsx` renders the selector and localized monthly/yearly planned prices.

### Phase 2: Polar Configuration Alignment
- Configure each paid Polar product with the supported currencies chosen above.
- Keep monthly and yearly products separate because Polar models billing-cycle variants as separate products.
- Store product IDs by plan and billing interval, not by "variant" naming.
- Rename env keys over time from `POLAR_*_VARIANT_ID` to `POLAR_*_MONTHLY_PRODUCT_ID` / `POLAR_*_YEARLY_PRODUCT_ID` to match Polar's model.

### Phase 3: Checkout Currency Consistency
- Extend `billing.createCheckout` input to accept `{ plan, interval, currency?, locale? }`.
- Validate requested currency against the supported table before passing it to Polar.
- Capture customer IP from trusted proxy headers in the API context and pass it as `customerIpAddress` / SDK equivalent to Polar checkout creation.
- Include `pricingRegion`, `displayCurrency`, `plan`, and `interval` in checkout metadata for support/debugging.
- Keep webhook plan/status updates as the only entitlement source.

### Phase 4: Signed-In Billing UI
- Return a `pricingDisplay` object from `billing.getCurrentPlan` with plan amount, currency, billing interval, and fallback note.
- Show current plan and upgrade options in the same resolved currency as the website when possible.
- If a workspace has an active subscription, display the subscribed currency from Polar/webhook data rather than recomputing it from current location.

Implementation notes:
- `apps/dashboard/src/components/billing-overview.tsx` now shows planned paid-plan prices in the same supported regions as the website.
- The dashboard selector persists to the shared `afterservice_pricing_region` cookie, so dashboard and website previews stay aligned.
- API-level checkout currency input remains future Phase 3 work; entitlement state is still webhook-derived.

### Phase 5: QA And Analytics
- Add unit tests for country-to-currency mapping, fallback behavior, and `Intl.NumberFormat` output.
- Browser-test `/pricing` with simulated US, GB, EU, CA, NG, and unknown-region cases.
- Sandbox-test Polar checkout for each enabled currency and verify displayed amount/currency matches the pricing page.
- Track `pricing_viewed`, `currency_selected`, and `checkout_started` with plan, interval, country, currency, and fallback reason.

## Trade-Offs
- Polar-driven charged amounts reduce billing risk, but require product setup discipline in the Polar dashboard.
- afterservice-owned display tables are simple and stable, but must be kept in sync with Polar product prices.
- Live FX conversion looks dynamic, but can create mismatch, tax ambiguity, and support issues. Avoid it for launch.
- IP geolocation is useful by default, but it can be wrong with VPNs, proxies, and server-side checkout creation. Always provide a manual selector.

## Open Questions
- Which countries are in the first paid pilot?
- Should Nigeria use NGN from day one or display USD until the buyer/payment flow is verified?
- Will yearly pricing launch with monthly pricing, or stay hidden until monthly conversion is proven?
- Should local prices be pure currency equivalents or region-adjusted prices?

## Brain Links
- Pricing strategy: `brain/product/pricing-strategy.md`
- Billing decision: `brain/decisions/0002-migrate-to-polar-billing.md`
- Dashboard locale routing decision: `brain/decisions/0003-dashboard-locale-routing.md`
- Billing feature: `brain/features/billing-entitlements-mvp.md`
