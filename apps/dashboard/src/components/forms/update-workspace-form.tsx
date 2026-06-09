"use client";

import { updateWorkspaceSettingsSchema } from "@afterservice/api/schemas";
import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import {
  Button,
  ComboboxDropdown,
  Input,
  Select,
  SelectContent,
  SelectItem,
  Skeleton,
  SelectTrigger,
  SelectValue,
} from "@afterservice/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { useEffect, useMemo } from "react";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
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

export function UpdateWorkspaceForm() {
  const { data: workspaceData, isLoading } =
    trpc.workspace.getCurrent.useQuery();
  const utils = trpc.useUtils();
  const track = useTrack();

  const updateMutation = trpc.workspace.updateSettings.useMutation({
    onSuccess: () => {
      utils.workspace.getCurrent.invalidate();
      track({
        event: LogEvents.WorkspaceUpdated.name,
        channel: LogEvents.WorkspaceUpdated.channel,
      });
    },
  });

  const form = useZodForm({
    schema: updateWorkspaceSettingsSchema,
    defaultValues: {
      name: "",
      businessType: "",
      serviceCategory: "",
      defaultFollowUpDelayDays: 7,
    },
  });
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

  function setBusinessType(item: { label: string }) {
    form.setValue("businessType", item.label, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("serviceCategory", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setServiceCategory(item: { label: string }) {
    form.setValue("serviceCategory", item.label, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  useEffect(() => {
    if (workspaceData?.item) {
      const w = workspaceData.item;
      form.reset({
        name: w.name,
        businessType: w.businessType ?? "",
        serviceCategory: w.serviceCategory ?? "",
        defaultFollowUpDelayDays: w.defaultFollowUpDelayDays,
      });
    }
  }, [workspaceData, form]);

  if (isLoading) {
    return <WorkspaceSettingsSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}
        className="space-y-8"
      >
        <section className="space-y-4 border-b border-border pb-8">
          <div>
            <h2 className="text-lg font-medium">Workspace profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These details shape default template suggestions and operator
              context.
            </p>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace name</FormLabel>
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
                  <FormLabel>Business type</FormLabel>
                  <ComboboxDropdown
                    items={[...BUSINESS_TYPE_SUGGESTIONS]}
                    selectedItem={selectedBusinessType}
                    onSelect={setBusinessType}
                    onCreate={(value) => {
                      const item = toCustomSuggestion(value);

                      if (item.label) {
                        setBusinessType(item);
                      }
                    }}
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
                  <FormLabel>Service category</FormLabel>
                  <ComboboxDropdown
                    items={serviceCategorySuggestions}
                    selectedItem={selectedServiceCategory}
                    onSelect={setServiceCategory}
                    onCreate={(value) => {
                      const item = toCustomSuggestion(value);

                      if (item.label) {
                        setServiceCategory(item);
                      }
                    }}
                    placeholder="Select or create a service category"
                    searchPlaceholder="Appliance repair, maintenance..."
                    renderOnCreate={(value) => `Use "${value}"`}
                    triggerClassName="h-9 bg-transparent"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Follow-up defaults</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set the default cadence used when jobs create follow-up work.
            </p>
          </div>
          <FormField
            control={form.control}
            name="defaultFollowUpDelayDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default follow-up delay</FormLabel>
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
                <FormDescription>
                  Existing follow-ups keep their current due dates.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </Form>
  );
}

function WorkspaceSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <section className="space-y-4 border-b border-border pb-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full max-w-[520px]" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-full max-w-[500px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
      </section>

      <Skeleton className="h-9 w-32" />
    </div>
  );
}
