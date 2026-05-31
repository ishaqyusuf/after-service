"use client";

import {
  Button,
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
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor={businessNameId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Business name</label>
          <Input id={businessNameId} name="businessName" required />
        </div>
        <div className="space-y-2">
          <label htmlFor={businessTypeId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Business type</label>
          <Input
            id={businessTypeId}
            name="businessType"
            placeholder="Repair shop, clinic, salon"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={serviceCategoryId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Service category</label>
          <Input
            id={serviceCategoryId}
            name="serviceCategory"
            placeholder="Appliance repair"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={followUpDelayId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Default follow-up delay
          </label>
          <select
            defaultValue="7"
            id={followUpDelayId}
            name="defaultFollowUpDelayDays"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
      {error ? <p className="text-[0.8rem] font-medium text-destructive">{error}</p> : null}
      <Button disabled={isPending} type="submit" className="w-full">
        {isPending ? "Creating workspace..." : "Create workspace"}
      </Button>
    </form>
  );
}
