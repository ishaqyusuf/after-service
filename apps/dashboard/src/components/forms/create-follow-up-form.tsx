"use client";

import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";

const createFollowUpSchema = z.object({
  channel: z.enum(["email", "sms", "phone", "whatsapp"]).default("email"),
  customerId: z.string().min(1, "Customer is required"),
  dueAt: z.coerce.date(),
  jobId: z.string().optional(),
  notes: z.string().trim().optional(),
  templateId: z.string().optional(),
});

export function CreateFollowUpForm({ defaultDue }: { defaultDue: string }) {
  const { data: customersData, isLoading: isLoadingCustomers } = trpc.customers.list.useQuery({ includeArchived: false });
  const { data: jobsData, isLoading: isLoadingJobs } = trpc.serviceJobs.list.useQuery();
  const { data: templatesData, isLoading: isLoadingTemplates } = trpc.templates.list.useQuery();

  const customers = customersData?.items ?? [];
  const jobs = jobsData?.items ?? [];
  const templates = templatesData?.items ?? [];

  const form = useZodForm({
    schema: createFollowUpSchema,
    defaultValues: {
      customerId: "",
      jobId: "",
      templateId: "",
      channel: "email",
      dueAt: defaultDue ? new Date(defaultDue) : new Date(),
      notes: "",
    }
  });

  const utils = trpc.useUtils();
  const createFollowUp = trpc.followUps.create.useMutation({
    onSuccess: () => {
      utils.followUps.listBoard.invalidate();
      utils.followUps.listTable.invalidate();
      form.reset();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => createFollowUp.mutate(data))} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Create follow-up</h2>
        <p className="text-sm text-muted-foreground">Setup manual or template-based follow ups.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="follow-up-customer">Customer</Label>
          <select 
            id="follow-up-customer" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("customerId")}
            disabled={isLoadingCustomers}
          >
            <option value="">{isLoadingCustomers ? "Loading customers..." : "Select customer"}</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {form.formState.errors.customerId && (
            <p className="text-sm text-destructive">{form.formState.errors.customerId.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-job">Related job</Label>
          <select 
            id="follow-up-job" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("jobId")}
            disabled={isLoadingJobs}
          >
            <option value="">{isLoadingJobs ? "Loading jobs..." : "No job"}</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-template">Template</Label>
          <select 
            id="follow-up-template" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("templateId")}
            disabled={isLoadingTemplates}
          >
            <option value="">{isLoadingTemplates ? "Loading templates..." : "No template"}</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-channel">Channel</Label>
          <select
            id="follow-up-channel"
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
          <Label htmlFor="follow-up-due-at">Due date</Label>
          <Input
            id="follow-up-due-at"
            type="date"
            {...form.register("dueAt", { valueAsDate: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-notes">Draft / notes</Label>
          <Textarea id="follow-up-notes" className="resize-y" {...form.register("notes")} />
        </div>
      </div>
      <Button disabled={customers.length === 0 || createFollowUp.isPending} type="submit" className="w-full">
        {createFollowUp.isPending ? "Adding..." : "Add to board"}
      </Button>
    </form>
  );
}
