import { z } from "zod";

export const oversightSummaryQuery = z
  .object({
    days: z.coerce
      .number()
      .pipe(z.union([z.literal(7), z.literal(30), z.literal(90)]))
      .default(30),
  })
  .strict();

export const oversightDirectoryQuery = z
  .object({
    search: z.string().trim().max(200).default(""),
    cursor: z.string().min(1).max(200).optional(),
  })
  .strict();
