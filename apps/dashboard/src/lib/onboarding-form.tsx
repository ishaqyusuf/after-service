"use client";

import { Button, Input, Select } from "@afterservice/ui";
import { useState } from "react";
import { getApiBaseUrl } from "./api-url";

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

    const response = await fetch(`${getApiBaseUrl()}/api/onboarding`, {
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
      <label htmlFor={businessNameId}>
        Business name
        <Input id={businessNameId} name="businessName" required />
      </label>
      <label htmlFor={businessTypeId}>
        Business type
        <Input
          id={businessTypeId}
          name="businessType"
          placeholder="Repair shop, clinic, salon"
        />
      </label>
      <label htmlFor={serviceCategoryId}>
        Service category
        <Input
          id={serviceCategoryId}
          name="serviceCategory"
          placeholder="Appliance repair"
        />
      </label>
      <label htmlFor={followUpDelayId}>
        Default follow-up delay
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
      </label>
      {error ? <p className="dashboard-form__error">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "Creating workspace..." : "Create workspace"}
      </Button>
    </form>
  );
}
