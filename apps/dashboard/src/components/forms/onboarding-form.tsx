"use client";

import {
  Button,
  Input,
  Select,
} from "@afterservice/ui";
import { useState } from "react";

import { onboardingSchema } from "@afterservice/api/schemas";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useTrack } from "@afterservice/events/client";
import { LogEvents } from "@afterservice/events";

export function OnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const track = useTrack();
  
  const form = useZodForm({
    schema: onboardingSchema,
    defaultValues: {
      businessName: "",
      businessType: "",
      serviceCategory: "",
      defaultFollowUpDelayDays: 7,
    }
  });

  async function onSubmit(data: z.infer<typeof onboardingSchema>) {
    setError(null);

    const response = await fetch("/api/onboarding", {
      body: JSON.stringify(data),
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
      return;
    }
    
    track({
      event: LogEvents.WorkspaceCreated.name,
      channel: LogEvents.WorkspaceCreated.channel,
    });

    window.location.href = "/";
  }

  const isPending = form.formState.isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="onboarding-business-name" className="text-sm font-medium leading-none">Business name</label>
          <Input id="onboarding-business-name" {...form.register("businessName")} />
          {form.formState.errors.businessName && (
            <p className="text-sm text-destructive">{form.formState.errors.businessName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="onboarding-business-type" className="text-sm font-medium leading-none">Business type</label>
          <Input
            id="onboarding-business-type"
            placeholder="Repair shop, clinic, salon"
            {...form.register("businessType")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="onboarding-service-category" className="text-sm font-medium leading-none">Service category</label>
          <Input
            id="onboarding-service-category"
            placeholder="Appliance repair"
            {...form.register("serviceCategory")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="onboarding-follow-up-delay" className="text-sm font-medium leading-none">
            Default follow-up delay
          </label>
          <select
            id="onboarding-follow-up-delay"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            {...form.register("defaultFollowUpDelayDays", { valueAsNumber: true })}
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
