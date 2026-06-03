"use client";

import { Button, Input, Label } from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useEffect } from "react";

import { updateWorkspaceSettingsSchema } from "@afterservice/api/schemas";


export function UpdateWorkspaceForm() {
  const { data: workspaceData, isLoading } = trpc.workspace.getCurrent.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.workspace.updateSettings.useMutation({
    onSuccess: () => {
      utils.workspace.getCurrent.invalidate();
    }
  });

  const form = useZodForm({
    schema: updateWorkspaceSettingsSchema,
    defaultValues: {
      name: "",
      businessType: "",
      serviceCategory: "",
      defaultFollowUpDelayDays: 7,
    }
  });

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
    return <div className="p-8 text-center text-muted-foreground">Loading workspace settings...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm max-w-xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="settings-workspace-name">Workspace name</Label>
          <Input
            id="settings-workspace-name"
            {...form.register("name")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-business-type">Business type</Label>
          <Input
            id="settings-business-type"
            {...form.register("businessType")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-service-category">Service category</Label>
          <Input
            id="settings-service-category"
            {...form.register("serviceCategory")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="settings-follow-up-delay">Default follow-up delay</Label>
          <select
            id="settings-follow-up-delay"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("defaultFollowUpDelayDays")}
          >
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
