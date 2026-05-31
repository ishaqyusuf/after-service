"use client";

import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";

const createJobSchema = z.object({
  amountDollars: z.coerce.number().nonnegative().optional(),
  completedAt: z.coerce.date(),
  customerId: z.string().min(1, "Customer is required"),
  nextFollowUpAt: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
  serviceCategory: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required"),
});

export function CreateJobForm({ defaultDue }: { defaultDue: string }) {
  const { data: customersData, isLoading: isLoadingCustomers } = trpc.customers.list.useQuery({ includeArchived: false });
  const customers = customersData?.items ?? [];

  const form = useZodForm({
    schema: createJobSchema,
    defaultValues: {
      customerId: "",
      title: "",
      serviceCategory: "",
      completedAt: new Date(),
      amountDollars: undefined,
      nextFollowUpAt: defaultDue ? new Date(defaultDue) : undefined,
      notes: "",
    }
  });

  const utils = trpc.useUtils();
  const createJob = trpc.serviceJobs.create.useMutation({
    onSuccess: () => {
      utils.serviceJobs.list.invalidate();
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof createJobSchema>) => {
    createJob.mutate({
      ...data,
      amountCents: data.amountDollars ? Math.round(data.amountDollars * 100) : undefined,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Log completed job</h2>
        <p className="text-sm text-muted-foreground">Log completed work and setup follow-ups.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-customer">Customer</Label>
          <select 
            id="job-customer" 
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
          <Label htmlFor="job-title">Service title</Label>
          <Input id="job-title" {...form.register("title")} />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-category">Category</Label>
          <Input
            id="job-category"
            placeholder="HVAC maintenance"
            {...form.register("serviceCategory")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-completed-at">Completed date</Label>
          <Input
            id="job-completed-at"
            type="date"
            {...form.register("completedAt", { valueAsDate: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-amount">Amount</Label>
          <Input
            id="job-amount"
            placeholder="250"
            type="number"
            {...form.register("amountDollars", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-next-follow-up">Next follow-up</Label>
          <Input
            id="job-next-follow-up"
            type="date"
            {...form.register("nextFollowUpAt", { valueAsDate: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-notes">Notes</Label>
          <Textarea id="job-notes" {...form.register("notes")} />
        </div>
      </div>
      <Button disabled={customers.length === 0 || createJob.isPending} type="submit" className="w-full">
        {createJob.isPending ? "Creating job..." : "Create job"}
      </Button>
    </form>
  );
}
