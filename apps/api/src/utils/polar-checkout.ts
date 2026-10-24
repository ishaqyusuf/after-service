import {
  getLocalizedPlanPrice,
  type PricingResolution,
  resolvePricingRegion,
} from "@afterservice/plans";
import {
  type BillingInterval,
  getCheckoutQuote,
  type PaidPlanId,
  pricingCurrencies,
} from "@afterservice/plans/checkout";
import type { models, Polar } from "@polar-sh/sdk/2026-10";

export const polarCurrency = {
  USD: "usd",
  CAD: "cad",
  GBP: "gbp",
  EUR: "eur",
  NGN: "ngn",
} as const;

export function assertPolarCheckoutMatchesQuote(
  checkout: Pick<
    models.Checkout,
    | "currency"
    | "amount"
    | "total_amount"
    | "product_id"
    | "customer_billing_address"
  >,
  quote: ReturnType<typeof getCheckoutQuote>,
  productId: string,
) {
  if (
    checkout.currency !== polarCurrency[quote.currency] ||
    checkout.amount !== quote.amountMinor ||
    checkout.total_amount !== quote.amountMinor ||
    checkout.product_id !== productId ||
    (quote.countryCode !== null &&
      checkout.customer_billing_address?.country !== quote.countryCode)
  ) {
    throw new Error(
      "Polar checkout does not match the displayed country or price",
    );
  }
}

export function getPolarProductId(
  plan: PaidPlanId,
  interval: BillingInterval,
  environment: "sandbox" | "production",
  env = process.env,
) {
  const prefix = environment === "sandbox" ? "POLAR_SANDBOX" : "POLAR";
  const key = `${prefix}_${plan.toUpperCase()}_${interval.toUpperCase()}_PRODUCT_ID`;
  const productId = env[key];
  if (!productId) throw new Error(`${key} is not configured`);
  return productId;
}

export async function createVerifiedPolarCheckout(
  input: {
    plan: PaidPlanId;
    interval: BillingInterval;
    pricing: PricingResolution;
    productId: string;
    organizationId: string;
    workspaceId: string;
    customerEmail?: string;
    customerName: string;
    customerIpAddress?: string;
    returnUrl: string;
  },
  polar: Pick<Polar, "products" | "checkouts">,
) {
  const quote = getCheckoutQuote(input.plan, input.interval, input.pricing);
  const product = await polar.products.get(input.productId);
  const recurringInterval = input.interval === "monthly" ? "month" : "year";
  if (
    product.is_archived ||
    product.organization_id !== input.organizationId ||
    product.recurring_interval !== recurringInterval ||
    product.recurring_interval_count !== 1
  ) {
    throw new Error(
      "The configured Polar product has the wrong billing interval or is archived",
    );
  }
  const currency = polarCurrency[quote.currency];
  const checkout = await polar.checkouts.create({
    products: [input.productId],
    external_customer_id: input.workspaceId,
    customer_email: input.customerEmail,
    customer_name: input.customerName,
    customer_ip_address: input.customerIpAddress,
    customer_billing_address: quote.countryCode
      ? { country: quote.countryCode as models.CountryAlpha2Input }
      : undefined,
    currency,
    prices: {
      [input.productId]: pricingCurrencies.flatMap((currencyCode) => {
        const pricing = resolvePricingRegion({ queryCurrency: currencyCode });
        if (
          input.interval === "yearly" &&
          getLocalizedPlanPrice(input.plan, pricing).yearly === null
        )
          return [];
        return [
          {
            amount_type: "fixed",
            price_amount: getCheckoutQuote(
              input.plan,
              input.interval,
              resolvePricingRegion({ queryCurrency: currencyCode }),
            ).amountMinor,
            price_currency: polarCurrency[currencyCode],
            tax_behavior: "inclusive",
          },
        ];
      }),
    },
    allow_discount_codes: false,
    allow_trial: false,
    locale: quote.locale,
    return_url: input.returnUrl,
    success_url: `${input.returnUrl}?checkout=success`,
    metadata: {
      teamId: input.workspaceId,
      plan: quote.plan,
      interval: quote.interval,
      pricingCountry: quote.countryCode ?? "unknown",
      displayCurrency: quote.currency,
      amountMinor: quote.amountMinor,
    },
  });
  assertPolarCheckoutMatchesQuote(checkout, quote, input.productId);
  return { checkoutUrl: checkout.url, checkoutId: checkout.id, quote };
}
