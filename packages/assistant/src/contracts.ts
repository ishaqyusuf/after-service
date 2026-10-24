import { z } from "zod";

const id = z.string().trim().min(1).max(100);
const text = z.string().trim().max(4000);
const short = z.string().trim().max(200);
const date = z
  .string()
  .min(1)
  .max(100)
  .describe(
    "Exact local date/time or ISO timestamp; use the operator timezone. Never guess a missing time.",
  );
export const channelSchema = z.enum(["email", "sms", "phone", "whatsapp"]);
const customer = z
  .object({
    name: short.min(1),
    email: z.string().email().or(z.literal("")).optional(),
    phone: short.optional(),
    companyName: short.optional(),
    tags: short.optional(),
    notes: text.optional(),
  })
  .strict();
const job = z
  .object({
    title: short.min(1),
    completedAt: date,
    amount: z
      .string()
      .regex(/^\d+(?:\.\d{1,2})?$/)
      .optional()
      .describe("Stated value in major units, e.g. 25000.00; never cents."),
    currency: z.enum(["USD", "NGN", "GBP", "EUR", "CAD"]).optional(),
    serviceCategory: short.optional(),
    notes: text.optional(),
    nextFollowUpAt: date.optional(),
  })
  .strict();
const followUp = z
  .object({
    customerId: id,
    jobId: id.optional(),
    templateId: id.optional(),
    channel: channelSchema.default("email"),
    dueAt: date,
    notes: text.optional(),
  })
  .strict();
const template = z
  .object({
    name: short.min(1),
    channel: channelSchema.default("email"),
    subject: short.optional(),
    body: text.min(1),
    isDefault: z.boolean().default(false),
  })
  .strict();
export const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("customer.create"), input: customer }),
  z.object({
    action: z.literal("customer.update"),
    input: customer.partial().extend({ id }),
  }),
  z.object({
    action: z.literal("customer.archive"),
    input: z.object({ id }).strict(),
  }),
  z.object({
    action: z.literal("job.create"),
    input: job.extend({ customerId: id }),
  }),
  z.object({
    action: z.literal("job.update"),
    input: job.partial().extend({
      id,
      status: z.enum(["completed", "needs_follow_up", "resolved"]).optional(),
    }),
  }),
  z.object({
    action: z.literal("job.complete"),
    input: z.object({ id }).strict(),
  }),
  z.object({
    action: z.literal("job.followUp"),
    input: followUp.omit({ customerId: true }).extend({ jobId: id }),
  }),
  z.object({ action: z.literal("followUp.create"), input: followUp }),
  z.object({
    action: z.literal("followUp.update"),
    input: followUp
      .omit({ customerId: true, jobId: true })
      .extend({ channel: channelSchema })
      .partial()
      .extend({
        id,
        status: z
          .enum(["open", "scheduled", "sent", "replied", "closed", "missed"])
          .optional(),
      }),
  }),
  z.object({
    action: z.literal("followUp.reschedule"),
    input: z.object({ id, dueAt: date }).strict(),
  }),
  z.object({
    action: z.literal("followUp.assign"),
    input: z.object({ id, assigneeId: id.nullable() }).strict(),
  }),
  z.object({
    action: z.literal("followUp.logPhone"),
    input: z
      .object({ id, recipient: short.min(1), body: text.min(1) })
      .strict(),
  }),
  z.object({
    action: z.literal("followUp.reply"),
    input: z.object({ id, notes: text.optional() }).strict(),
  }),
  z.object({
    action: z.literal("followUp.close"),
    input: z.object({ id, notes: text.optional() }).strict(),
  }),
  z.object({ action: z.literal("template.create"), input: template }),
  z.object({
    action: z.literal("template.update"),
    input: template
      .extend({ channel: channelSchema, isDefault: z.boolean() })
      .partial()
      .extend({ id }),
  }),
  z.object({
    action: z.literal("template.archive"),
    input: z.object({ id }).strict(),
  }),
  z.object({
    action: z.literal("template.default"),
    input: z.object({ id }).strict(),
  }),
  z.object({
    action: z.literal("workspace.update"),
    input: z
      .object({
        name: short.min(1).optional(),
        businessType: short.optional(),
        serviceCategory: short.optional(),
        defaultFollowUpDelayDays: z.number().int().min(1).max(365).optional(),
      })
      .strict(),
  }),
]);
export type AssistantAction = z.infer<typeof actionSchema>;
export type ActionName = AssistantAction["action"];
export const readSchema = z
  .object({
    kind: z.enum([
      "overview",
      "customers",
      "jobs",
      "followUps",
      "templates",
      "members",
      "settings",
      "billing",
      "report",
      "help",
      "messages",
    ]),
    query: short.optional(),
    id: id.optional(),
    cursor: id.optional(),
    customerId: id
      .optional()
      .describe(
        "Filter jobs, follow-ups or messages by an exact customer ID from a scoped read.",
      ),
    followUpId: id
      .optional()
      .describe("Filter logged messages for an exact follow-up ID."),
    status: z
      .enum(["due", "overdue", "upcoming", "waiting", "replied", "closed"])
      .optional(),
    from: z.string().date().optional(),
    to: z.string().date().optional(),
  })
  .strict();
export type AssistantRead = z.infer<typeof readSchema>;
export type RecordCard = {
  kind: "records";
  title: string;
  records: { id: string; label: string; detail: string; href: string }[];
  nextCursor?: string | null;
  asOf: string;
};
export type SummaryCard = {
  kind: "summary";
  title: string;
  facts: { label: string; value: string }[];
  links: { label: string; href: string }[];
  asOf: string;
};
export type DraftCard = {
  kind: "message";
  title: string;
  body: string;
  subject?: string;
  href?: string;
};
export type AssistantCard =
  | RecordCard
  | SummaryCard
  | DraftCard
  | { kind: "proposal"; id: string };
export const draftMessageSchema = z
  .object({
    title: short.min(1),
    subject: short.optional(),
    body: text.min(1),
    followUpId: id.optional(),
  })
  .strict();
export const scopeSchema = z.object({ actorId: id, workspaceId: id });
export type AssistantScope = z.infer<typeof scopeSchema>;
