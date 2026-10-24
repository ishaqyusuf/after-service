"use client";

import { onboardingSchema } from "@afterservice/api/schemas";
import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import {
  Button,
  ComboboxDropdown,
  type ComboboxItem,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@afterservice/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QuickFill } from "@/components/quick-fill";
import { useZodForm } from "@/hooks/use-zod-form";
import {
  clearOnboardingDraft,
  type OnboardingDraftStorage,
  readOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboarding-draft";
import {
  type OnboardingValues,
  onboardingFailureMessage,
  submitOnboarding,
} from "@/lib/onboarding-request";
import {
  BUSINESS_TYPE_SUGGESTIONS,
  DEFAULT_SERVICE_CATEGORY_SUGGESTIONS,
  getBusinessTypeId,
  getSelectedSuggestion,
  SERVICE_CATEGORY_SUGGESTIONS_BY_BUSINESS_TYPE,
  toCustomSuggestion,
} from "@/lib/onboarding-suggestions";

const followUpDelayOptions = [
  { label: "3 days", value: "3" },
  { label: "7 days", value: "7" },
  { label: "14 days", value: "14" },
  { label: "30 days", value: "30" },
] as const;

const onboardingSkeletonFields = [
  "business-name",
  "business-type",
  "service-category",
  "follow-up-delay",
] as const;

const defaultValues = {
  businessName: "",
  businessType: "",
  serviceCategory: "",
  defaultFollowUpDelayDays: 7,
};

export function OnboardingForm({ userId }: { userId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const storage = useRef<OnboardingDraftStorage | null>(null);
  const track = useTrack();

  const form = useZodForm({
    schema: onboardingSchema,
    defaultValues,
  });

  useEffect(() => {
    try {
      storage.current = window.sessionStorage;
    } catch {
      storage.current = null;
    }
    const draft = readOnboardingDraft(storage.current, userId);
    form.reset(draft ?? defaultValues);
    setDraftRestored(Boolean(draft));
    const subscription = form.watch((values) => {
      saveOnboardingDraft(storage.current, userId, values);
    });
    setDraftReady(true);
    return () => subscription.unsubscribe();
  }, [form, userId]);

  const mutation = useMutation({
    mutationFn: (values: OnboardingValues) => submitOnboarding(values),
    retry: false,
    onSuccess: (result) => {
      if (result.status === "unauthorized") {
        const saved = saveOnboardingDraft(
          storage.current,
          userId,
          form.getValues(),
        );
        setDraftSaved(saved);
        setNeedsSignIn(true);
        setError(
          saved
            ? "Your session expired. Sign in again to continue. Your business details will be restored in this tab."
            : "Your session expired. Sign in in a new tab, then return here and try again. Keep this page open to retain your business details.",
        );
        return;
      }
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      clearOnboardingDraft(storage.current, userId);
      try {
        track({
          event: LogEvents.WorkspaceCreated.name,
          channel: LogEvents.WorkspaceCreated.channel,
        });
      } catch {
        // Optional analytics must not interrupt completed setup.
      }
      window.location.href = "/";
    },
    onError: () => setError(onboardingFailureMessage),
  });

  function onSubmit(values: OnboardingValues) {
    setError(null);
    setNeedsSignIn(false);
    saveOnboardingDraft(storage.current, userId, values);
    mutation.mutate(values);
  }

  const isPending = mutation.isPending;
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        aria-busy={isPending}
      >
        {draftRestored ? (
          <p role="status" className="text-sm text-muted-foreground">
            Your business details have been restored. Continue where you left
            off.
          </p>
        ) : null}
        <fieldset disabled={isPending || !draftReady} className="space-y-6">
          <div className="flex justify-end">
            <QuickFill name="onboarding" />
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessType"
              render={() => (
                <FormItem>
                  <FormLabel>Business type (optional)</FormLabel>
                  <ComboboxDropdown
                    items={[...BUSINESS_TYPE_SUGGESTIONS]}
                    selectedItem={selectedBusinessType}
                    onSelect={setBusinessType}
                    onCreate={createBusinessType}
                    placeholder="Select or create a business type"
                    searchPlaceholder="Repair shop, clinic, salon..."
                    renderOnCreate={(value) => `Use "${value}"`}
                    triggerClassName="h-9 bg-transparent"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceCategory"
              render={() => (
                <FormItem>
                  <FormLabel>Service category (optional)</FormLabel>
                  <ComboboxDropdown
                    key={businessType}
                    items={serviceCategorySuggestions}
                    selectedItem={selectedServiceCategory}
                    onSelect={setServiceCategory}
                    onCreate={createServiceCategory}
                    placeholder="Select or create a service category"
                    searchPlaceholder="Appliance repair, maintenance..."
                    renderOnCreate={(value) => `Use "${value}"`}
                    triggerClassName="h-9 bg-transparent"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultFollowUpDelayDays"
              render={({ field }) => (
                <FormItem>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FormLabel className="inline-flex w-fit items-center gap-1.5">
                          Default follow-up delay
                          <Info
                            aria-hidden="true"
                            className="size-3.5 text-muted-foreground"
                          />
                        </FormLabel>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-64 text-balance">
                        How many days after a completed job afterservice uses as
                        the starting due date for new follow-ups. You can change
                        individual follow-ups later.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delay" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {followUpDelayOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {error ? (
            <div
              role="alert"
              className="space-y-2 text-sm font-medium text-destructive"
            >
              <p>{error}</p>
              {needsSignIn ? (
                <a
                  href="/sign-in?return_to=%2Fonboarding"
                  target={draftSaved ? undefined : "_blank"}
                  rel={draftSaved ? undefined : "noopener noreferrer"}
                  className="inline-block underline underline-offset-4"
                >
                  {draftSaved ? "Sign in to continue" : "Sign in in a new tab"}
                </a>
              ) : null}
            </div>
          ) : null}
          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? "Creating workspace..." : "Create workspace"}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}

export function OnboardingFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {onboardingSkeletonFields.map((field) => (
          <div key={field} className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
