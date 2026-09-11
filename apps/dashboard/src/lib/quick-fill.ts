"use client";

import { createQaCustomerFixture } from "@afterservice/utils";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type QuickFillForm = Pick<UseFormReturn<FieldValues>, "setValue">;
const quickFillCustomerSchema = z.object({
  id: z.string(),
});
const quickFillJobSchema = z.object({
  customerId: z.string(),
  id: z.string(),
});
const quickFillTemplateSchema = z.object({
  channel: z.enum(["email", "sms", "phone", "whatsapp"]),
  id: z.string(),
});

export const quickFillArgsSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("customer"),
  }),
  z.object({
    customers: z.array(quickFillCustomerSchema).optional(),
    name: z.literal("job"),
  }),
  z.object({
    customers: z.array(quickFillCustomerSchema).optional(),
    jobs: z.array(quickFillJobSchema).optional(),
    name: z.literal("followUp"),
    templates: z.array(quickFillTemplateSchema).optional(),
  }),
  z.object({
    name: z.literal("scheduleFollowUp"),
    templates: z.array(quickFillTemplateSchema).optional(),
  }),
  z.object({ name: z.literal("workNote") }),
  z.object({ name: z.literal("messageDraft") }),
  z.object({ name: z.literal("template") }),
  z.object({ name: z.literal("workspace") }),
  z.object({ name: z.literal("onboarding") }),
  z.object({ name: z.literal("signUpIdentity") }),
]);

export type QuickFillArgsInput = z.infer<typeof quickFillArgsSchema>;
export type QuickFillName = QuickFillArgsInput["name"];
export type QuickFillArgsFor<Name extends QuickFillName> = Extract<
  QuickFillArgsInput,
  { name: Name }
>;
export type QuickFillArgs = {
  [Name in QuickFillName]: Omit<QuickFillArgsFor<Name>, "name">;
};

export type QaQuickFillContext = {
  invocation: number;
  qaDomain: string;
  seed: string;
};

export function parseQuickFillArgs<Name extends QuickFillName>(
  input: QuickFillArgsFor<Name>,
) {
  return quickFillArgsSchema.parse(input) as QuickFillArgsFor<Name>;
}

export function applyQuickFill(
  form: QuickFillForm,
  input: unknown,
  context: QaQuickFillContext,
) {
  const parsed = quickFillArgsSchema.parse(input);

  switch (parsed.name) {
    case "customer":
      return fillCustomer(form, parsed, context);
    case "job":
      return fillJob(form, parsed, context);
    case "followUp":
      return fillFollowUp(form, parsed, context);
    case "scheduleFollowUp":
      return fillScheduleFollowUp(form, parsed, context);
    case "workNote":
      return fillWorkNote(form, parsed, context);
    case "messageDraft":
      return fillMessageDraft(form, parsed, context);
    case "template":
      return fillTemplate(form, parsed, context);
    case "workspace":
    case "onboarding":
      return fillWorkspace(form, parsed, context);
    case "signUpIdentity":
      return fillSignUpIdentity(form, parsed, context);
  }
}

const serviceCategories = [
  "Brake inspection",
  "Engine diagnostic",
  "HVAC maintenance",
  "Oil change",
  "Preventive maintenance",
  "Tire rotation",
  "Transmission service",
  "Warranty repair",
];

function stableHash(value: string) {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function setQuickFillValue(form: QuickFillForm, name: string, value: unknown) {
  form.setValue(name, value, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: true,
  });
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function fillCustomer(
  form: QuickFillForm,
  _args: QuickFillArgs["customer"] | undefined,
  context: QaQuickFillContext,
) {
  const fixture = createQaCustomerFixture({
    invocation: context.invocation,
    qaDomain: context.qaDomain,
    seed: context.seed,
  });

  setQuickFillValue(form, "name", fixture.name);
  setQuickFillValue(form, "phone", fixture.phone);
  setQuickFillValue(form, "email", fixture.email);
  setQuickFillValue(form, "companyName", fixture.companyName);
  setQuickFillValue(form, "tags", fixture.tags.join(", "));
  setQuickFillValue(form, "notes", fixture.notes);
}

function fillJob(
  form: QuickFillForm,
  args: QuickFillArgs["job"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:job`);
  const serviceCategory =
    serviceCategories[hash % serviceCategories.length] ??
    "Preventive maintenance";
  const completedAt = new Date(
    Date.UTC(2026, 0, 1 + (hash % 240), 12, 0, 0),
  );
  const nextFollowUpAt = new Date(
    completedAt.getTime() + (7 + (hash % 24)) * 86_400_000,
  );
  const vehicle = `QA Vehicle ${hash.toString(36).toUpperCase()}`;
  const customer = args?.customers?.length
    ? args.customers[hash % args.customers.length]
    : null;

  if (customer) {
    setQuickFillValue(form, "customerId", customer.id);
  }
  setQuickFillValue(form, "title", `${serviceCategory} for ${vehicle}`);
  setQuickFillValue(form, "serviceCategory", serviceCategory);
  setQuickFillValue(form, "completedAt", toDateInputValue(completedAt));
  setQuickFillValue(
    form,
    "amountDollars",
    75 + (hash % 876),
  );
  setQuickFillValue(form, "nextFollowUpAt", toDateInputValue(nextFollowUpAt));
  setQuickFillValue(
    form,
    "notes",
    `Deterministic QA job fixture ${hash.toString(36)}. Safe to purge.`,
  );
}

function deterministicDate(hash: number, extraDays = 0) {
  return new Date(Date.UTC(2026, 8, 1 + (hash % 20) + extraDays, 12, 0, 0));
}

function fillFollowUp(
  form: QuickFillForm,
  args: QuickFillArgs["followUp"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:follow-up`);
  const customer = args?.customers?.length
    ? args.customers[hash % args.customers.length]
    : null;
  const jobs = customer
    ? args?.jobs?.filter((job) => job.customerId === customer.id)
    : args?.jobs;
  const job = jobs?.length ? jobs[hash % jobs.length] : null;
  const template = args?.templates?.find((entry) => entry.channel === "email");

  if (customer) setQuickFillValue(form, "customerId", customer.id);
  if (job) setQuickFillValue(form, "jobId", job.id);
  if (template) setQuickFillValue(form, "templateId", template.id);
  setQuickFillValue(form, "channel", "email");
  setQuickFillValue(form, "dueAt", deterministicDate(hash));
  setQuickFillValue(
    form,
    "notes",
    `QA follow-up draft ${hash.toString(36)}. Review before submitting.`,
  );
}

function fillScheduleFollowUp(
  form: QuickFillForm,
  args: QuickFillArgs["scheduleFollowUp"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:schedule`);
  const template = args?.templates?.find((entry) => entry.channel === "email");
  setQuickFillValue(form, "channel", "email");
  setQuickFillValue(form, "dueAt", deterministicDate(hash, 7));
  if (template) setQuickFillValue(form, "templateId", template.id);
  setQuickFillValue(
    form,
    "notes",
    `QA scheduled follow-up ${hash.toString(36)}.`,
  );
}

function fillWorkNote(
  form: QuickFillForm,
  _args: QuickFillArgs["workNote"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:work-note`);
  setQuickFillValue(
    form,
    "notes",
    `QA reply summary ${hash.toString(36)}: customer confirmed receipt.`,
  );
}

function fillMessageDraft(
  form: QuickFillForm,
  _args: QuickFillArgs["messageDraft"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:message`);
  setQuickFillValue(
    form,
    "recipient",
    `qa.message.${hash.toString(36)}@${context.qaDomain}`,
  );
  setQuickFillValue(form, "subject", "QA after-service check-in");
  setQuickFillValue(
    form,
    "body",
    `QA message draft ${hash.toString(36)}. Review the routed recipient before sending.`,
  );
}

function fillTemplate(
  form: QuickFillForm,
  _args: QuickFillArgs["template"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:template`);
  setQuickFillValue(form, "name", `QA Check-in ${hash.toString(36)}`);
  setQuickFillValue(form, "channel", "email");
  setQuickFillValue(form, "subject", "A quick QA follow-up");
  setQuickFillValue(
    form,
    "body",
    "Hi {{customer_name}}, this is a QA check-in after {{service_name}}.",
  );
  setQuickFillValue(form, "isDefault", false);
}

function fillWorkspace(
  form: QuickFillForm,
  _args: QuickFillArgs["workspace"] | undefined,
  context: QaQuickFillContext,
) {
  const hash = stableHash(`${context.seed}:${context.invocation}:workspace`);
  setQuickFillValue(form, "name", `QA Service Workshop ${hash.toString(36)}`);
  setQuickFillValue(form, "businessName", `QA Service Workshop ${hash.toString(36)}`);
  setQuickFillValue(form, "businessType", "Auto service");
  setQuickFillValue(form, "serviceCategory", "Vehicle maintenance");
  setQuickFillValue(form, "defaultFollowUpDelayDays", 7);
}

function fillSignUpIdentity(
  form: QuickFillForm,
  _args: QuickFillArgs["signUpIdentity"] | undefined,
  context: QaQuickFillContext,
) {
  const fixture = createQaCustomerFixture({
    invocation: context.invocation,
    qaDomain: context.qaDomain,
    seed: `${context.seed}:signup`,
  });
  setQuickFillValue(form, "name", fixture.name.replace("Customer", "Operator"));
  setQuickFillValue(form, "email", fixture.email.replace("customer", "operator"));
}

export const quickFillers = {
  customer: fillCustomer,
  followUp: fillFollowUp,
  job: fillJob,
  messageDraft: fillMessageDraft,
  onboarding: fillWorkspace,
  scheduleFollowUp: fillScheduleFollowUp,
  signUpIdentity: fillSignUpIdentity,
  template: fillTemplate,
  workNote: fillWorkNote,
  workspace: fillWorkspace,
};
