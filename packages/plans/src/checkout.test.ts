import { expect, test } from "bun:test";
import {
  getCheckoutQuote,
  getPricingSignupPath,
  parsePricingPreference,
  resolveRequestPricing,
} from "./checkout.js";
import { resolvePricingRegion } from "./index.js";

test("marketing handoff preserves country/currency across dashboard signup and later API requests", () => {
  const pricing = resolvePricingRegion({ country: "NG" });
  expect(getPricingSignupPath(pricing)).toBe("/signup?pricing=NGN%3ANG");
  const later = resolveRequestPricing(
    new Headers({
      cookie: "other=abc; afterservice-pricing=NGN%3ANG",
      "x-vercel-ip-country": "GB",
    }),
  );
  expect(later).toMatchObject({ countryCode: "NG", currency: "NGN" });
  expect(getCheckoutQuote("business", "monthly", later).amountMinor).toBe(
    500000,
  );
  expect(() => getCheckoutQuote("business", "yearly", later)).toThrow(
    RangeError,
  );
});

test.each([
  "USD",
  "usd:NG",
  "JPY:JP",
  "USD:XX",
  "USD:NG:extra",
  "USD:invalid",
  "",
])("malformed preference %s cannot replace country pricing", (value) => {
  expect(parsePricingPreference(value)).toBeNull();
  expect(
    resolveRequestPricing(
      new Headers({
        cookie: `afterservice-pricing=${value}`,
        "x-vercel-ip-country": "NG",
      }),
    ).currency,
  ).toBe("NGN");
});

test("unknown country stays unknown through a supported USD handoff", () => {
  const pricing = resolveRequestPricing(
    new Headers({ cookie: "afterservice-pricing=USD%3A" }),
  );
  expect(pricing).toMatchObject({ currency: "USD", countryCode: null });
});

test("Business is monthly-only in every currency", () => {
  for (const country of ["NG", "US", "GB", "DE", "CA"]) {
    expect(() =>
      getCheckoutQuote("business", "yearly", resolvePricingRegion({ country })),
    ).toThrow(RangeError);
  }
});
