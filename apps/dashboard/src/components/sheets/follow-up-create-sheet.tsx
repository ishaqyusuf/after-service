"use client";

import { createFollowUpSchema } from "@afterservice/api/schemas";
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useZodForm } from "@/hooks/use-zod-form";

export function FollowUpCreateSheet() {
  const { createFollowUp, setParams } = useFollowUpParams();

  const { data: customersData, isLoading: isLoadingCustomers } = trpc.customers.list.useQuery({ includeArchived: false });
  const { data: jobsData, isLoading: isLoadingJobs } = trpc.serviceJobs.list.useQuery();
  const { data: templatesData, isLoading: isLoadingTemplates } = trpc.templates.list.useQuery();

  const customers = customersData?.items ?? [];
  const jobs = jobsData?.items ?? [];
  const templates = templatesData?.items ?? [];

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  const form = useZodForm({
    schema: createFollowUpSchema,
    defaultValues: {
      customerId: "",
      jobId: "",
      templateId: "",
      channel: "email",
      dueAt: defaultDue,
      notes: "",
    }
  });

  const utils = trpc.useUtils();
  const createFollowUpMutation = trpc.followUps.create.useMutation({
    onSuccess: () => {
      utils.followUps.listBoard.invalidate();
      utils.followUps.listTable.invalidate();
      form.reset();
      setParams({ createFollowUp: null });
    },
  });

  return (
    <Sheet
      open={createFollowUp ?? false}
      onOpenChange={(isOpen) => setParams({ createFollowUp: isOpen ? true : null })}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create follow-up</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <form
            onSubmit={form.handleSubmit((data) => createFollowUpMutation.mutate(data))}
            className="space-y-6"
          >
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
            <Button
              type="submit"
              className="w-full"
              disabled={customers.length === 0 || createFollowUpMutation.isPending}
            >
              {createFollowUpMutation.isPending ? "Adding..." : "Add to board"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
