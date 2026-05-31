"use client";

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useQueryState } from "nuqs";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useEffect } from "react";

const scheduleFollowUpSchema = z.object({
  jobId: z.string().min(1),
  channel: z.enum(["email", "sms", "phone", "whatsapp"]).default("email"),
  dueAt: z.coerce.date(),
  notes: z.string().trim().optional(),
  templateId: z.string().optional(),
});

export function ScheduleFollowUpSheet() {
  const [jobId, setJobId] = useQueryState("schedule_follow_up");

  const { data: jobData, isLoading: isLoadingJob } = trpc.serviceJobs.get.useQuery(
    { id: jobId! },
    { enabled: !!jobId }
  );

  const { data: templatesData, isLoading: isLoadingTemplates } = trpc.templates.list.useQuery(
    undefined,
    { enabled: !!jobId }
  );

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  const form = useZodForm({
    schema: scheduleFollowUpSchema,
    defaultValues: {
      jobId: "",
      channel: "email",
      dueAt: defaultDue,
      notes: "",
      templateId: "",
    }
  });

  useEffect(() => {
    if (jobData?.item && jobId) {
      form.reset({
        jobId: jobData.item.id,
        channel: "email",
        dueAt: jobData.item.nextFollowUpAt ? new Date(jobData.item.nextFollowUpAt) : defaultDue,
        notes: `Follow up about ${jobData.item.title}.`,
        templateId: "",
      });
    }
  }, [jobData, jobId, form]);

  const utils = trpc.useUtils();
  const createFollowUp = trpc.serviceJobs.createFollowUp.useMutation({
    onSuccess: () => {
      utils.serviceJobs.list.invalidate();
      utils.followUps.listTable.invalidate();
      utils.followUps.listBoard.invalidate();
      setJobId(null);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) setJobId(null);
  };

  const templates = templatesData?.items ?? [];

  return (
    <Sheet open={!!jobId} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Schedule Follow-up</SheetTitle>
          <SheetDescription>
            {jobData?.item ? `Create a follow up action for ${jobData.item.title}.` : "Loading job details..."}
          </SheetDescription>
        </SheetHeader>
        
        {isLoadingJob || isLoadingTemplates ? (
          <div className="mt-6 flex justify-center py-8">Loading...</div>
        ) : (
          <form onSubmit={form.handleSubmit((data) => createFollowUp.mutate(data))} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                {...form.register("dueAt", { valueAsDate: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("channel")}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("templateId")}
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                {...form.register("notes")}
              />
            </div>
            <Button type="submit" disabled={createFollowUp.isPending} className="w-full mt-4">
              {createFollowUp.isPending ? "Creating..." : "Create follow-up"}
            </Button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
