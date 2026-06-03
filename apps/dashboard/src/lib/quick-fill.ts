"use client";

import { faker } from "@faker-js/faker";
import type { FieldValues, UseFormReturn } from "react-hook-form";

type QuickFillForm = Pick<UseFormReturn<FieldValues>, "setValue">;
type QuickFillCustomer = {
  id: string;
};

export type QuickFillArgs = {
  customer: Record<string, never>;
  job: {
    customers?: QuickFillCustomer[];
  };
};

const customerTags = [
  "vip",
  "warranty",
  "fleet",
  "follow-up",
  "repeat",
  "priority",
  "inspection",
  "maintenance",
];

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

function randomSuffix() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }

  return faker.string.alphanumeric(8).toLowerCase();
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

function fillCustomer(form: QuickFillForm, _args?: QuickFillArgs["customer"]) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const emailName = faker.helpers
    .slugify(`${firstName}.${lastName}`)
    .toLowerCase();
  const tags = faker.helpers.arrayElements(customerTags, {
    max: 3,
    min: 2,
  });

  setQuickFillValue(form, "name", `${firstName} ${lastName}`);
  setQuickFillValue(form, "phone", faker.phone.number());
  setQuickFillValue(
    form,
    "email",
    `${emailName}.${randomSuffix()}@afterservice.test`,
  );
  setQuickFillValue(form, "companyName", faker.company.name());
  setQuickFillValue(form, "tags", tags.join(", "));
  setQuickFillValue(form, "notes", faker.lorem.paragraph());
}

function fillJob(form: QuickFillForm, args?: QuickFillArgs["job"]) {
  const serviceCategory = faker.helpers.arrayElement(serviceCategories);
  const completedAt = faker.date.recent({ days: 45 });
  const nextFollowUpAt = faker.date.soon({ days: 30, refDate: completedAt });
  const vehicle = faker.vehicle.vehicle();
  const customer = args?.customers?.length
    ? faker.helpers.arrayElement(args.customers)
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
    faker.number.int({ max: 950, min: 75 }),
  );
  setQuickFillValue(form, "nextFollowUpAt", toDateInputValue(nextFollowUpAt));
  setQuickFillValue(form, "notes", faker.lorem.paragraph());
}

export const quickFillers = {
  customer: fillCustomer,
  job: fillJob,
};

export type QuickFillName = keyof typeof quickFillers;
