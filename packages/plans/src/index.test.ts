import { describe, expect, test } from "bun:test";
import {
  getHeaderPricingHints,
  getLocalizedPlanPrice,
  resolvePricingRegion,
} from "./index.js";

function resolveHeaders(values: Record<string, string>) {
  return resolvePricingRegion(getHeaderPricingHints(new Headers(values)));
}

describe("country-based pricing", () => {
  test.each([
    ["NG", "NGN", "₦44,950"],
    ["GB", "GBP", "£25"],
    ["US", "USD", "$29"],
    ["CA", "CAD", "$39"],
    ["DE", "EUR", "€27"],
    ["FR", "EUR", "€27"],
  ] as const)("%s uses %s despite British browser language", (country, currency, amount) => {
    const pricing = resolveHeaders({
      "x-vercel-ip-country": country,
      "accept-language": "en-GB,en;q=0.9",
    });
    expect(pricing.currency).toBe(currency);
    expect(pricing.countryCode).toBe(country);
    expect(getLocalizedPlanPrice("starter", pricing).formattedMonthly).toBe(
      amount,
    );
  });

  test("Cloudflare visitor country wins over Vercel's proxy country and stale custom hints", () => {
    const pricing = resolveHeaders({
      "cf-ipcountry": "NG",
      "cf-ray": "test-LOS",
      "x-vercel-ip-country": "GB",
      "x-user-country": "GB",
      "accept-language": "en-GB",
    });
    expect(pricing).toMatchObject({
      countryCode: "NG",
      currency: "NGN",
      source: "country",
    });
  });

  test("Vercel visitor country wins over custom hints on direct deployments", () => {
    expect(
      resolveHeaders({ "x-vercel-ip-country": "NG", "x-user-country": "GB" })
        .currency,
    ).toBe("NGN");
  });

  test.each([
    "AU",
    "IN",
    "SE",
    "CH",
    "PL",
  ])("unsupported %s falls back to USD instead of language or continent currency", (country) => {
    const pricing = resolveHeaders({
      "x-vercel-ip-country": country,
      "x-vercel-ip-continent": "EU",
      "accept-language": "en-GB",
    });
    expect(pricing).toMatchObject({
      countryCode: country,
      currency: "USD",
      region: "OTHER",
    });
    expect(pricing.note).toContain("USD");
  });

  test.each([
    "en-GB,en;q=0.9",
    "en-NG",
    "ca",
    "de",
    "fr",
    "",
  ])("language %s alone does not establish a visitor's country", (language) => {
    expect(resolveHeaders({ "accept-language": language })).toMatchObject({
      currency: "USD",
      countryCode: null,
      source: "fallback",
    });
  });

  test.each([
    "",
    "XX",
    "T1",
    "invalid",
  ])("Cloudflare's missing/unknown country %s never falls through to the proxy's location", (country) => {
    expect(
      resolveHeaders({
        "cf-ray": "test-LOS",
        "cf-ipcountry": country,
        "x-vercel-ip-country": "GB",
      }),
    ).toMatchObject({ currency: "USD", source: "fallback" });
  });

  test("custom hints remain available without a deployment geolocation header", () => {
    expect(resolveHeaders({ "x-user-country": " ng " })).toMatchObject({
      currency: "NGN",
      countryCode: "NG",
    });
  });

  test("invalid country hints use a clear USD fallback", () => {
    expect(resolvePricingRegion({ country: "invalid" })).toMatchObject({
      currency: "USD",
      region: "OTHER",
      source: "fallback",
    });
  });

  test("UK alias and lowercase country hints are normalized", () => {
    expect(resolvePricingRegion({ country: " uk " })).toMatchObject({
      currency: "GBP",
      countryCode: "GB",
    });
  });

  test("explicit support overrides still take precedence", () => {
    expect(
      resolvePricingRegion({ country: "NG", queryRegion: "GB" }),
    ).toMatchObject({ currency: "GBP", source: "query" });
    expect(
      resolvePricingRegion({ country: "GB", queryCurrency: "ngn" }),
    ).toMatchObject({ currency: "NGN", source: "query" });
    expect(
      resolvePricingRegion({
        country: "NG",
        queryCurrency: "invalid",
        queryRegion: "invalid",
      }).currency,
    ).toBe("NGN");
  });

  test("the same currency converts monthly, yearly, and free beta amounts", () => {
    const pricing = resolvePricingRegion({ country: "NG" });
    expect(getLocalizedPlanPrice("starter", pricing)).toMatchObject({
      currency: "NGN",
      monthly: 44950,
      yearly: 449500,
    });
    expect(getLocalizedPlanPrice("shop", pricing).monthly).toBe(122450);
    expect(getLocalizedPlanPrice("growth", pricing).monthly).toBe(230950);
    expect(getLocalizedPlanPrice("free_beta", pricing)).toMatchObject({
      monthly: 0,
      yearly: null,
    });
  });
});
