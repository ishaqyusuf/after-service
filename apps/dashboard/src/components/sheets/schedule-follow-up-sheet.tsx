"use client";

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { trpc } from "@/components/providers/trpc-provider";
import { useQueryState } from "nuqs";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useEffect } from "react";
import { SheetFormSkeleton } from "./sheet-form-skeleton";

const scheduleFollowUpSchema = z.object({
  jobId: z.string().min(1),
  channel: z.enum(["email", "sms", "phone", "whatsapp"]).default("email"),
  dueAt: z.coerce.date(),
  notes: z.string().trim().optional(),
  templateId: z.string().optional(),
});

const channelOptions = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Phone", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
] as const;

const EMPTY_OPTION_VALUE = "__empty__";

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
            {jobData?.item
              ? `Create a follow up action for ${jobData.item.title}.`
              : "Create a follow up action for this service job."}
          </SheetDescription>
        </SheetHeader>

        {isLoadingJob || isLoadingTemplates ? (
          <SheetFormSkeleton fields={4} />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createFollowUp.mutate({
                  ...data,
                  templateId: data.templateId || undefined,
                }),
              )}
              className="mt-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={toDateInputValue(field.value)}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              ? new Date(`${event.target.value}T00:00:00`)
                              : undefined,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channelOptions.map((option) => (
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
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(
                          value === EMPTY_OPTION_VALUE ? "" : value,
                        )
                      }
                      value={field.value || EMPTY_OPTION_VALUE}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EMPTY_OPTION_VALUE}>
                          No template
                        </SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={createFollowUp.isPending}
                className="mt-4 w-full"
              >
                {createFollowUp.isPending ? "Creating..." : "Create follow-up"}
              </Button>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}
