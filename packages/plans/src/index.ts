export type PublicPlanId =
  | "free_beta"
  | "business"
  | "starter"
  | "shop"
  | "growth";
export type PricingRegion = "US" | "CA" | "GB" | "EU" | "NG" | "OTHER";
export type PricingRegionSource = "country" | "fallback" | "query";

export type PricingCurrency = "CAD" | "EUR" | "GBP" | "NGN" | "USD";

type PlanPrice = {
  monthly: number;
  yearly: number | null;
};

type RegionPricing = {
  countryCode: string | null;
  currency: PricingCurrency;
  label: string;
  locale: string;
  note: string | null;
};

export type PricingResolution = {
  countryCode: string | null;
  currency: PricingCurrency;
  label: string;
  locale: string;
  note: string | null;
  region: PricingRegion;
  source: PricingRegionSource;
};

export const planPricingUsd = {
  free_beta: { monthly: 0, yearly: null },
  business: { monthly: 7, yearly: null },
  starter: { monthly: 29, yearly: 290 },
  shop: { monthly: 79, yearly: 790 },
  growth: { monthly: 149, yearly: 1490 },
} satisfies Record<PublicPlanId, PlanPrice>;

// Approved regional Business prices; these are not currency conversions.
export const businessMonthlyPrices = {
  CAD: 10,
  EUR: 7,
  GBP: 5,
  NGN: 5000,
  USD: planPricingUsd.business.monthly,
} satisfies Record<PricingCurrency, number>;

export const localCurrencyConversionFromUsd = {
  CAD: 1.35,
  EUR: 0.93,
  GBP: 0.86,
  NGN: 1550,
  USD: 1,
} satisfies Record<PricingCurrency, number>;

// Polar sandbox/API limit verified on 2026-10-24. Do not advertise an annual
// amount the provider cannot collect in the selected currency.
const checkoutMaximumAmount: Partial<Record<PricingCurrency, number>> = {
  NGN: 1_550_000,
};

const euCountryCodes = new Set([
  "AT",
  "BE",
  "CY",
  "DE",
  "EE",
  "ES",
  "FI",
  "FR",
  "GR",
  "HR",
  "IE",
  "IT",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PT",
  "SI",
  "SK",
]);

const regionPricing: Record<PricingRegion, RegionPricing> = {
  US: {
    countryCode: "US",
    currency: "USD",
    label: "United States",
    locale: "en-US",
    note: null,
  },
  CA: {
    countryCode: "CA",
    currency: "CAD",
    label: "Canada",
    locale: "en-CA",
    note: "Planned local display; checkout will confirm the final billing amount.",
  },
  GB: {
    countryCode: "GB",
    currency: "GBP",
    label: "United Kingdom",
    locale: "en-GB",
    note: "Planned local display; checkout will confirm the final billing amount.",
  },
  EU: {
    countryCode: null,
    currency: "EUR",
    label: "Eurozone",
    locale: "en-IE",
    note: "Planned local display; checkout will confirm the final billing amount.",
  },
  NG: {
    countryCode: "NG",
    currency: "NGN",
    label: "Nigeria",
    locale: "en-NG",
    note: "Planned local display; checkout will confirm local currency availability.",
  },
  OTHER: {
    countryCode: null,
    currency: "USD",
    label: "Other / USD",
    locale: "en-US",
    note: "Local pricing is not set for this region yet; prices are shown in USD.",
  },
};

function normalize(value: string | null | undefined) {
  return value?.trim().toUpperCase() ?? "";
}

function isPricingRegion(value: string): value is PricingRegion {
  return Object.hasOwn(regionPricing, value);
}

function normalizeCountry(value: string | null | undefined) {
  const country = normalize(value);
  if (!/^[A-Z]{2}$/.test(country) || country === "XX") return null;
  return country === "UK" ? "GB" : country;
}

function getRegionFromCurrency(value: string | null | undefined) {
  switch (normalize(value)) {
    case "CAD":
      return "CA";
    case "EUR":
      return "EU";
    case "GBP":
      return "GB";
    case "NGN":
      return "NG";
    case "USD":
      return "US";
    default:
      return null;
  }
}

function getRegionFromCountry(value: string | null | undefined) {
  const countryCode = normalize(value);

  if (countryCode === "CA") return "CA";
  if (countryCode === "GB" || countryCode === "UK") return "GB";
  if (countryCode === "NG") return "NG";
  if (countryCode === "US") return "US";
  if (euCountryCodes.has(countryCode)) return "EU";

  return null;
}

export function getHeaderPricingHints(headers: {
  get(name: string): string | null;
}) {
  // Behind Cloudflare, Vercel can geolocate the proxy rather than the visitor.
  // Missing Cloudflare geolocation must not fall through to that proxy country.
  const cloudflareCountry = headers.get("cf-ipcountry");
  const country =
    cloudflareCountry !== null || headers.get("cf-ray")
      ? cloudflareCountry
      : (headers.get("x-vercel-ip-country") ?? headers.get("x-user-country"));

  return {
    country: normalizeCountry(country),
  };
}

export function resolvePricingRegion({
  country,
  queryCurrency,
  queryRegion,
}: {
  country?: string | null;
  queryCurrency?: string | null;
  queryRegion?: string | null;
}): PricingResolution {
  const normalizedQueryRegion = normalize(queryRegion);
  const queryResolvedRegion = isPricingRegion(normalizedQueryRegion)
    ? normalizedQueryRegion
    : getRegionFromCurrency(queryCurrency);

  if (queryResolvedRegion) {
    return toPricingResolution(queryResolvedRegion, "query");
  }

  const countryCode = normalizeCountry(country);
  if (countryCode) {
    return toPricingResolution(
      getRegionFromCountry(countryCode) ?? "OTHER",
      "country",
      countryCode,
    );
  }

  return toPricingResolution("OTHER", "fallback");
}

export function toPricingResolution(
  region: PricingRegion,
  source: PricingRegionSource,
  countryCode?: string | null,
): PricingResolution {
  const pricing = regionPricing[region];

  return {
    countryCode: countryCode ?? pricing.countryCode,
    currency: pricing.currency,
    label: pricing.label,
    locale: pricing.locale,
    note: pricing.note,
    region,
    source,
  };
}

export function getLocalizedPlanPrice(
  planId: PublicPlanId,
  pricing: PricingResolution,
) {
  const region = regionPricing[pricing.region];
  const sourcePrice = planPricingUsd[planId];
  const monthly =
    planId === "business"
      ? businessMonthlyPrices[region.currency]
      : convertUsdToLocalCurrency(sourcePrice.monthly, region.currency);
  const convertedYearly =
    sourcePrice.yearly === null
      ? null
      : convertUsdToLocalCurrency(sourcePrice.yearly, region.currency);
  const maximum = checkoutMaximumAmount[region.currency];
  const yearly =
    convertedYearly !== null &&
    maximum !== undefined &&
    convertedYearly > maximum
      ? null
      : convertedYearly;

  return {
    currency: region.currency,
    formattedMonthly: formatCurrency({
      amount: monthly,
      currency: region.currency,
      locale: region.locale,
    }),
    formattedYearly:
      yearly === null
        ? null
        : formatCurrency({
            amount: yearly,
            currency: region.currency,
            locale: region.locale,
          }),
    monthly,
    yearly,
  };
}

export function convertUsdToLocalCurrency(
  amountUsd: number,
  currency: PricingCurrency,
) {
  const convertedAmount = amountUsd * localCurrencyConversionFromUsd[currency];

  return Math.round(convertedAmount);
}

export function formatCurrency({
  amount,
  currency,
  locale,
}: {
  amount: number;
  currency: PricingCurrency;
  locale: string;
}) {
  return new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}
