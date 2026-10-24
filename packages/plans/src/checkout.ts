import {
  getHeaderPricingHints,
  getLocalizedPlanPrice,
  type PricingCurrency,
  type PricingResolution,
  resolvePricingRegion,
} from "@afterservice/plans";

export const paidPlanIds = ["business"] as const;
export type PaidPlanId = (typeof paidPlanIds)[number];
export const billingIntervals = ["monthly", "yearly"] as const;
export type BillingInterval = (typeof billingIntervals)[number];
export const pricingCurrencies = ["USD", "CAD", "GBP", "EUR", "NGN"] as const;
export const pricingCookieName = "afterservice-pricing";

export function getCheckoutQuote(
  plan: PaidPlanId,
  interval: BillingInterval,
  pricing: PricingResolution,
) {
  const price = getLocalizedPlanPrice(plan, pricing);
  const amount = interval === "monthly" ? price.monthly : price.yearly;
  if (amount === null)
    throw new RangeError(
      "This billing interval is unavailable in this currency. Choose monthly billing.",
    );
  return {
    plan,
    interval,
    countryCode: pricing.countryCode,
    currency: price.currency,
    amount,
    amountMinor: Math.round(amount * 100),
    locale: pricing.locale,
  };
}

export function parsePricingPreference(value: string | null | undefined) {
  if (!value) return null;
  const parts = value.split(":");
  if (parts.length !== 2) return null;
  const [currency, country = ""] = parts;
  if (!pricingCurrencies.some((item) => item === currency)) return null;
  if (country && !/^[A-Z]{2}$/.test(country)) return null;
  if (country === "XX") return null;
  return {
    currency: currency as PricingCurrency,
    countryCode: country || null,
  };
}

export function serializePricingPreference(
  pricing: Pick<PricingResolution, "currency" | "countryCode">,
) {
  return `${pricing.currency}:${pricing.countryCode ?? ""}`;
}

export function getPricingSignupPath(pricing: PricingResolution) {
  const query = new URLSearchParams({
    pricing: serializePricingPreference(pricing),
  });
  return `/signup?${query}`;
}

export function getPricingBusinessPath(pricing: PricingResolution) {
  const query = new URLSearchParams({
    pricing: serializePricingPreference(pricing),
    return_to: "/billing",
  });
  return `/login?${query}`;
}

export function resolveRequestPricing(headers: {
  get(name: string): string | null;
}) {
  const cookie = headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${pricingCookieName}=`));
  let preference = null;
  try {
    preference = parsePricingPreference(
      cookie
        ? decodeURIComponent(cookie.slice(pricingCookieName.length + 1))
        : null,
    );
  } catch {
    /* Ignore malformed cookies and use request geolocation. */
  }
  if (preference) {
    const pricing = resolvePricingRegion({
      queryCurrency: preference.currency,
    });
    return { ...pricing, countryCode: preference.countryCode };
  }
  return resolvePricingRegion(getHeaderPricingHints(headers));
}
