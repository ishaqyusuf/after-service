"use client";

import { createJobSchema } from "@afterservice/api/schemas";
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
import { Form } from "@afterservice/ui/form";
import type { z } from "zod";
import { trpc } from "@/components/providers/trpc-provider";
import { QuickFill } from "@/components/quick-fill";
import { useJobParams } from "@/hooks/use-job-params";
import { useZodForm } from "@/hooks/use-zod-form";

export function JobCreateSheet() {
  const { createJob, setParams } = useJobParams();

  const { data: customersData, isLoading: isLoadingCustomers } =
    trpc.customers.list.useQuery({ includeArchived: false });
  const customers = customersData?.items ?? [];

  const form = useZodForm({
    schema: createJobSchema,
    defaultValues: {
      customerId: "",
      title: "",
      serviceCategory: "",
      completedAt: new Date(),
      amountDollars: undefined,
      nextFollowUpAt: undefined,
      notes: "",
    },
  });

  const utils = trpc.useUtils();
  const createJobMutation = trpc.serviceJobs.create.useMutation({
    onSuccess: () => {
      utils.serviceJobs.list.invalidate();
      form.reset();
      setParams({ createJob: null });
    },
  });

  const onSubmit = (data: z.infer<typeof createJobSchema>) => {
    createJobMutation.mutate({
      ...data,
      amountCents: data.amountDollars
        ? Math.round(data.amountDollars * 100)
        : undefined,
    });
  };

  return (
    <Sheet
      open={createJob ?? false}
      onOpenChange={(isOpen) => setParams({ createJob: isOpen ? true : null })}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log completed job</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-end">
                <QuickFill name="job" args={{ customers }} />
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
                    <option value="">
                      {isLoadingCustomers
                        ? "Loading customers..."
                        : "Select customer"}
                    </option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.customerId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.customerId.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-title">Service title</Label>
                  <Input id="job-title" {...form.register("title")} />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
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
              <Button
                disabled={customers.length === 0 || createJobMutation.isPending}
                type="submit"
                className="w-full"
              >
                {createJobMutation.isPending ? "Creating job..." : "Create job"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
