import {
  billingIntervals,
  paidPlanIds,
  pricingCurrencies,
} from "@afterservice/plans/checkout";
import { z } from "zod";

export const createCheckoutSchema = z
  .object({
    plan: z.enum(paidPlanIds),
    interval: z.enum(billingIntervals),
    currency: z.enum(pricingCurrencies),
    countryCode: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .nullable(),
    expectedAmountMinor: z.number().int().positive(),
  })
  .strict()
  .optional();
