"use client";

import { onboardingSchema } from "@afterservice/api/schemas";
import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import {
  Button,
  ComboboxDropdown,
  type ComboboxItem,
  Input,
} from "@afterservice/ui";
import { useMemo, useState } from "react";
import type { z } from "zod";
import { useZodForm } from "@/hooks/use-zod-form";
import {
  BUSINESS_TYPE_SUGGESTIONS,
  DEFAULT_SERVICE_CATEGORY_SUGGESTIONS,
  getBusinessTypeId,
  getSelectedSuggestion,
  SERVICE_CATEGORY_SUGGESTIONS_BY_BUSINESS_TYPE,
  toCustomSuggestion,
} from "@/lib/onboarding-suggestions";

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
    },
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
  const businessType = form.watch("businessType");
  const serviceCategory = form.watch("serviceCategory");
  const businessTypeId = getBusinessTypeId(businessType);
  const serviceCategorySuggestions = useMemo(
    () =>
      (businessTypeId
        ? SERVICE_CATEGORY_SUGGESTIONS_BY_BUSINESS_TYPE[businessTypeId]
        : undefined) ?? DEFAULT_SERVICE_CATEGORY_SUGGESTIONS,
    [businessTypeId],
  );
  const selectedBusinessType = getSelectedSuggestion(
    BUSINESS_TYPE_SUGGESTIONS,
    businessType,
  );
  const selectedServiceCategory = getSelectedSuggestion(
    serviceCategorySuggestions,
    serviceCategory,
  );

  function setBusinessType(item: ComboboxItem) {
    form.setValue("businessType", item.label, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("serviceCategory", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function createBusinessType(value: string) {
    const customBusinessType = toCustomSuggestion(value);

    if (customBusinessType.label) {
      setBusinessType(customBusinessType);
    }
  }

  function setServiceCategory(item: ComboboxItem) {
    form.setValue("serviceCategory", item.label, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function createServiceCategory(value: string) {
    const customServiceCategory = toCustomSuggestion(value);

    if (customServiceCategory.label) {
      setServiceCategory(customServiceCategory);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="onboarding-business-name"
            className="text-sm font-medium leading-none"
          >
            Business name
          </label>
          <Input
            id="onboarding-business-name"
            {...form.register("businessName")}
          />
          {form.formState.errors.businessName && (
            <p className="text-sm text-destructive">
              {form.formState.errors.businessName.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="onboarding-business-type"
            className="text-sm font-medium leading-none"
          >
            Business type
          </label>
          <ComboboxDropdown
            id="onboarding-business-type"
            items={[...BUSINESS_TYPE_SUGGESTIONS]}
            selectedItem={selectedBusinessType}
            onSelect={setBusinessType}
            onCreate={createBusinessType}
            placeholder="Select or create a business type"
            searchPlaceholder="Repair shop, clinic, salon..."
            renderOnCreate={(value) => `Use "${value}"`}
            triggerClassName="h-9 bg-transparent"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="onboarding-service-category"
            className="text-sm font-medium leading-none"
          >
            Service category
          </label>
          <ComboboxDropdown
            id="onboarding-service-category"
            items={serviceCategorySuggestions}
            selectedItem={selectedServiceCategory}
            onSelect={setServiceCategory}
            onCreate={createServiceCategory}
            placeholder="Select or create a service category"
            searchPlaceholder="Appliance repair, maintenance..."
            renderOnCreate={(value) => `Use "${value}"`}
            triggerClassName="h-9 bg-transparent"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="onboarding-follow-up-delay"
            className="text-sm font-medium leading-none"
          >
            Default follow-up delay
          </label>
          <select
            id="onboarding-follow-up-delay"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            {...form.register("defaultFollowUpDelayDays", {
              valueAsNumber: true,
            })}
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
      {error ? (
        <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
      ) : null}
      <Button disabled={isPending} type="submit" className="w-full">
        {isPending ? "Creating workspace..." : "Create workspace"}
      </Button>
    </form>
  );
}
