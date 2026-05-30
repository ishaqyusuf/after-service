"use client";

import {
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
} from "@afterservice/ui";
import { useState } from "react";

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const businessNameId = "onboarding-business-name";
  const businessTypeId = "onboarding-business-type";
  const serviceCategoryId = "onboarding-service-category";
  const followUpDelayId = "onboarding-follow-up-delay";

  async function handleSubmit(formData: FormData) {
    setError(null);
    setIsPending(true);

    const response = await fetch("/api/onboarding", {
      body: JSON.stringify({
        businessName: String(formData.get("businessName") ?? ""),
        businessType: String(formData.get("businessType") ?? ""),
        defaultFollowUpDelayDays: Number(
          formData.get("defaultFollowUpDelayDays") ?? 7,
        ),
        serviceCategory: String(formData.get("serviceCategory") ?? ""),
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (response.status === 401) {
      window.location.href = "/sign-in";
      return;
    }

    if (!response.ok) {
      setError("Workspace setup failed.");
      setIsPending(false);
      return;
    }

    window.location.href = "/";
  }

  return (
    <form action={handleSubmit} className="dashboard-form">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={businessNameId}>Business name</FieldLabel>
          <Input id={businessNameId} name="businessName" required />
        </Field>
        <Field>
          <FieldLabel htmlFor={businessTypeId}>Business type</FieldLabel>
          <Input
            id={businessTypeId}
            name="businessType"
            placeholder="Repair shop, clinic, salon"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={serviceCategoryId}>Service category</FieldLabel>
          <Input
            id={serviceCategoryId}
            name="serviceCategory"
            placeholder="Appliance repair"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={followUpDelayId}>
            Default follow-up delay
          </FieldLabel>
          <Select
            defaultValue="7"
            id={followUpDelayId}
            name="defaultFollowUpDelayDays"
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </Select>
        </Field>
      </FieldGroup>
      {error ? <p className="dashboard-form__error">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Creating workspace..." : "Create workspace"}
      </Button>
    </form>
  );
}
