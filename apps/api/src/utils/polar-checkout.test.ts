import { afterEach, expect, spyOn, test } from "bun:test";
import {
  getLocalizedPlanPrice,
  resolvePricingRegion,
} from "@afterservice/plans";
import {
  billingIntervals,
  getCheckoutQuote,
  paidPlanIds,
  pricingCurrencies,
} from "@afterservice/plans/checkout";
import { createPolar } from "@polar-sh/sdk/2026-10";
import { getBillingRequestContext } from "./billing-request";
import {
  createVerifiedPolarCheckout,
  getPolarProductId,
} from "./polar-checkout";

afterEach(() => {
  mockFetch?.mockRestore();
});
let mockFetch: ReturnType<typeof spyOn<typeof globalThis, "fetch">> | undefined;
const provider = createPolar({
  environment: "sandbox",
  accessToken: "sandbox-unit-test",
});
const productId = "00000000-0000-4000-8000-000000000001";

for (const country of ["NG", "GB", "US", "CA", "DE", "AU"]) {
  for (const plan of paidPlanIds) {
    for (const interval of billingIntervals) {
      test(`${country} ${plan} ${interval}: real SDK payload matches displayed amount and currency`, async () => {
        const pricing = resolvePricingRegion({ country });
        if (
          interval === "yearly" &&
          getLocalizedPlanPrice(plan, pricing).yearly === null
        ) {
          expect(() => getCheckoutQuote(plan, interval, pricing)).toThrow(
            RangeError,
          );
          return;
        }
        const quote = getCheckoutQuote(plan, interval, pricing);
        let requestBody: Record<string, unknown> = {};
        mockFetch = spyOn(globalThis, "fetch").mockImplementation(
          Object.assign(
            async (url: Parameters<typeof fetch>[0], options?: RequestInit) => {
              expect(String(url)).toStartWith("https://sandbox-api.polar.sh/");
              if (options?.method === "POST") {
                requestBody = JSON.parse(String(options.body));
                return Response.json({
                  id: "test-checkout",
                  url: "https://sandbox.polar.sh/checkout/test",
                  currency: quote.currency.toLowerCase(),
                  amount: quote.amountMinor,
                  total_amount: quote.amountMinor,
                  product_id: productId,
                  customer_billing_address: { country },
                });
              }
              return Response.json({
                id: productId,
                organization_id: "test-org",
                is_archived: false,
                recurring_interval: interval === "monthly" ? "month" : "year",
                recurring_interval_count: 1,
              });
            },
            { preconnect: globalThis.fetch.preconnect },
          ),
        );
        await createVerifiedPolarCheckout(
          {
            plan,
            interval,
            pricing,
            productId,
            organizationId: "test-org",
            workspaceId: "test-workspace",
            customerEmail: "pricing@afterservice.invalid",
            customerName: "Test",
            customerIpAddress: "203.0.113.9",
            returnUrl: "https://app-afterservice.localhost/billing",
          },
          provider,
        );
        expect(requestBody).toMatchObject({
          currency: quote.currency.toLowerCase(),
          customer_billing_address: { country },
          customer_ip_address: "203.0.113.9",
          allow_discount_codes: false,
          allow_trial: false,
          prices: {
            [productId]: pricingCurrencies
              .filter(
                (currencyCode) =>
                  interval !== "yearly" ||
                  getLocalizedPlanPrice(
                    plan,
                    resolvePricingRegion({ queryCurrency: currencyCode }),
                  ).yearly !== null,
              )
              .map((currencyCode) => ({
                amount_type: "fixed",
                price_amount: getCheckoutQuote(
                  plan,
                  interval,
                  resolvePricingRegion({ queryCurrency: currencyCode }),
                ).amountMinor,
                price_currency: currencyCode.toLowerCase(),
                tax_behavior: "inclusive",
              })),
          },
          metadata: {
            plan,
            interval,
            displayCurrency: quote.currency,
            amountMinor: quote.amountMinor,
            teamId: "test-workspace",
          },
        });
      });
    }
  }
}

test.each([
  "wrong-interval",
  "wrong-amount",
  "wrong-currency",
  "extra-tax",
  "wrong-country",
])("rejects provider %s instead of redirecting to a mismatched checkout", async (mode) => {
  mockFetch = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (_url: Parameters<typeof fetch>[0], options?: RequestInit) => {
        if (options?.method === "POST")
          return Response.json({
            id: "test",
            url: "https://sandbox.polar.sh/checkout/test",
            currency: mode === "wrong-currency" ? "gbp" : "usd",
            amount: mode === "wrong-amount" ? 1 : 700,
            total_amount: mode === "extra-tax" ? 800 : 700,
            product_id: productId,
            customer_billing_address: {
              country: mode === "wrong-country" ? "GB" : "US",
            },
          });
        return Response.json({
          id: productId,
          organization_id: "test-org",
          is_archived: false,
          recurring_interval: mode === "wrong-interval" ? "year" : "month",
          recurring_interval_count: 1,
        });
      },
      { preconnect: globalThis.fetch.preconnect },
    ),
  );
  await expect(
    createVerifiedPolarCheckout(
      {
        plan: "business",
        interval: "monthly",
        pricing: resolvePricingRegion({ country: "US" }),
        productId,
        organizationId: "test-org",
        workspaceId: "test-workspace",
        customerEmail: "pricing@afterservice.invalid",
        customerName: "Test",
        returnUrl: "https://app-afterservice.localhost/billing",
      },
      provider,
    ),
  ).rejects.toThrow();
});

test("sandbox products never use production IDs", () => {
  expect(() =>
    getPolarProductId("business", "monthly", "sandbox", {
      POLAR_BUSINESS_MONTHLY_PRODUCT_ID: productId,
    }),
  ).toThrow("POLAR_SANDBOX_BUSINESS_MONTHLY_PRODUCT_ID");
});

test("visitor IP follows the same proxy as country and rejects forwarded lists", () => {
  const context = getBillingRequestContext(
    new Headers({
      "cf-ray": "test-LOS",
      "cf-ipcountry": "NG",
      "cf-connecting-ip": "203.0.113.9",
      "x-real-ip": "198.51.100.9",
    }),
  );
  expect(context.customerIpAddress).toBe("203.0.113.9");
  expect(context.pricing.currency).toBe("NGN");
  expect(
    getBillingRequestContext(
      new Headers({ "x-real-ip": "203.0.113.9, 198.51.100.9" }),
    ).customerIpAddress,
  ).toBeUndefined();
});
