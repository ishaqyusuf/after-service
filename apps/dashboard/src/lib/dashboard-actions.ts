"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerCaller } from "./trpc-server";

function optionalString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

function requiredString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalDate(formData: FormData, key: string) {
  const value = optionalString(formData, key);
  return value ? new Date(value) : undefined;
}

export async function createCustomerAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.customers.create({
    companyName: optionalString(formData, "companyName"),
    email: optionalString(formData, "email"),
    name: requiredString(formData, "name"),
    notes: optionalString(formData, "notes"),
    phone: optionalString(formData, "phone"),
    tags: optionalString(formData, "tags"),
  });
  revalidatePath("/customers");
  revalidatePath("/");
}

export async function updateCustomerAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.customers.update({
    companyName: optionalString(formData, "companyName"),
    email: optionalString(formData, "email"),
    id: requiredString(formData, "id"),
    name: requiredString(formData, "name"),
    notes: optionalString(formData, "notes"),
    phone: optionalString(formData, "phone"),
    tags: optionalString(formData, "tags"),
  });
  revalidatePath("/customers");
}

export async function archiveCustomerAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.customers.archive({ id: requiredString(formData, "id") });
  revalidatePath("/customers");
  revalidatePath("/");
}

export async function createJobAction(formData: FormData) {
  const caller = await getServerCaller();
  const amount = optionalString(formData, "amountDollars");
  await caller.serviceJobs.create({
    amountCents: amount ? Math.round(Number(amount) * 100) : undefined,
    completedAt: new Date(requiredString(formData, "completedAt")),
    customerId: requiredString(formData, "customerId"),
    nextFollowUpAt: optionalDate(formData, "nextFollowUpAt"),
    notes: optionalString(formData, "notes"),
    serviceCategory: optionalString(formData, "serviceCategory"),
    title: requiredString(formData, "title"),
  });
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function createFollowUpFromJobAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.serviceJobs.createFollowUp({
    channel: (optionalString(formData, "channel") ?? "email") as
      | "email"
      | "sms"
      | "phone"
      | "whatsapp",
    dueAt: optionalDate(formData, "dueAt"),
    jobId: requiredString(formData, "jobId"),
    notes: optionalString(formData, "notes"),
    templateId: optionalString(formData, "templateId"),
  });
  revalidatePath("/jobs");
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function createFollowUpAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.followUps.create({
    channel: (optionalString(formData, "channel") ?? "email") as
      | "email"
      | "sms"
      | "phone"
      | "whatsapp",
    customerId: requiredString(formData, "customerId"),
    dueAt: new Date(requiredString(formData, "dueAt")),
    jobId: optionalString(formData, "jobId"),
    notes: optionalString(formData, "notes"),
    templateId: optionalString(formData, "templateId"),
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function rescheduleFollowUpAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.followUps.reschedule({
    dueAt: new Date(requiredString(formData, "dueAt")),
    id: requiredString(formData, "id"),
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function markFollowUpSentAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.followUps.markSent({
    body: requiredString(formData, "body"),
    id: requiredString(formData, "id"),
    recipient: requiredString(formData, "recipient"),
    subject: optionalString(formData, "subject"),
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function markFollowUpRepliedAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.followUps.markReplied({
    id: requiredString(formData, "id"),
    notes: optionalString(formData, "notes"),
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function closeFollowUpAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.followUps.close({
    id: requiredString(formData, "id"),
    notes: optionalString(formData, "notes"),
  });
  revalidatePath("/follow-ups");
  revalidatePath("/");
}

export async function createTemplateAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.templates.create({
    body: requiredString(formData, "body"),
    channel: (optionalString(formData, "channel") ?? "email") as
      | "email"
      | "sms"
      | "phone"
      | "whatsapp",
    isDefault: formData.get("isDefault") === "on",
    name: requiredString(formData, "name"),
    subject: optionalString(formData, "subject"),
  });
  revalidatePath("/templates");
}

export async function updateTemplateAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.templates.update({
    body: requiredString(formData, "body"),
    channel: (optionalString(formData, "channel") ?? "email") as
      | "email"
      | "sms"
      | "phone"
      | "whatsapp",
    id: requiredString(formData, "id"),
    isDefault: formData.get("isDefault") === "on",
    name: requiredString(formData, "name"),
    subject: optionalString(formData, "subject"),
  });
  revalidatePath("/templates");
}

export async function archiveTemplateAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.templates.archive({ id: requiredString(formData, "id") });
  revalidatePath("/templates");
}

export async function setDefaultTemplateAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.templates.setDefault({ id: requiredString(formData, "id") });
  revalidatePath("/templates");
}

export async function updateWorkspaceAction(formData: FormData) {
  const caller = await getServerCaller();
  await caller.workspace.updateSettings({
    businessType: optionalString(formData, "businessType"),
    defaultFollowUpDelayDays: Number(
      formData.get("defaultFollowUpDelayDays") ?? 7,
    ),
    name: requiredString(formData, "name"),
    serviceCategory: optionalString(formData, "serviceCategory"),
  });
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function startCheckoutAction() {
  const caller = await getServerCaller();
  const { checkoutUrl } = await caller.billing.createCheckout();
  redirect(checkoutUrl);
}
