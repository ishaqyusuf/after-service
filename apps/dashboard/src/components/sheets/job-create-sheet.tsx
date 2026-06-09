"use client";

import { createJobSchema } from "@afterservice/api/schemas";
import {
  Button,
  Calendar,
  ComboboxDropdown,
  type ComboboxItem,
  Icons,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { format } from "date-fns";
import { useMemo } from "react";
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
  const { data: jobsData } = trpc.serviceJobs.list.useQuery({ limit: 100 });
  const jobs = jobsData?.items ?? [];

  const customerItems = useMemo(
    () =>
      customers.map((customer) => ({
        id: customer.id,
        label: customer.name,
      })),
    [customers],
  );
  const serviceTitleItems = useMemo(
    () => toUniqueComboboxItems(jobs.map((job) => job.title)),
    [jobs],
  );
  const serviceCategoryItems = useMemo(
    () => toUniqueComboboxItems(jobs.map((job) => job.serviceCategory)),
    [jobs],
  );

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
  const selectedCustomerId = form.watch("customerId");

  const utils = trpc.useUtils();
  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: ({ item }) => {
      utils.customers.list.invalidate();
      form.setValue("customerId", item.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
  });
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
          <SheetDescription>
            Record completed service work and queue the next follow-up.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <div className="flex justify-end">
                <QuickFill name="job" args={{ customers }} />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <ComboboxDropdown
                        items={customerItems}
                        selectedItem={customerItems.find(
                          (item) => item.id === field.value,
                        )}
                        onSelect={(item) => field.onChange(item.id)}
                        onCreate={(value) => {
                          const name = value.trim();

                          if (name) {
                            createCustomerMutation.mutate({ name });
                          }
                        }}
                        createPosition="first"
                        disabled={isLoadingCustomers}
                        placeholder={
                          isLoadingCustomers
                            ? "Loading customers..."
                            : "Select or create customer"
                        }
                        searchPlaceholder="Search customers..."
                        renderOnCreate={(value) => `Create "${value}"`}
                        triggerClassName="h-9 bg-transparent"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service title</FormLabel>
                      <ComboboxDropdown
                        items={serviceTitleItems}
                        selectedItem={toSelectedComboboxItem(field.value)}
                        onSelect={(item) => field.onChange(item.label)}
                        onCreate={(value) => field.onChange(value.trim())}
                        createPosition="first"
                        placeholder="Select or create service title"
                        searchPlaceholder="Maintenance, repair, installation..."
                        renderOnCreate={(value) => `Create "${value}"`}
                        triggerClassName="h-9 bg-transparent"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serviceCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <ComboboxDropdown
                        items={serviceCategoryItems}
                        selectedItem={toSelectedComboboxItem(field.value)}
                        onSelect={(item) => field.onChange(item.label)}
                        onCreate={(value) => field.onChange(value.trim())}
                        createPosition="first"
                        placeholder="Select or create category"
                        searchPlaceholder="HVAC maintenance, detailing..."
                        renderOnCreate={(value) => `Create "${value}"`}
                        triggerClassName="h-9 bg-transparent"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Completed date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value instanceof Date
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                              <Icons.CalendarMonth className="ml-auto size-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value instanceof Date
                                ? field.value
                                : undefined
                            }
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amountDollars"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="250"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : Number(val),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nextFollowUpAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Next follow-up</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value instanceof Date
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                              <Icons.CalendarMonth className="ml-auto size-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value instanceof Date
                                ? field.value
                                : undefined
                            }
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
              </div>
              <Button
                disabled={!selectedCustomerId || createJobMutation.isPending}
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

function toUniqueComboboxItems(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values.flatMap((value) => {
        const label = value?.trim();

        return label ? [label] : [];
      }),
    ),
  )
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      id: value,
      label: value,
    })) satisfies ComboboxItem[];
}

function toSelectedComboboxItem(value: string | null | undefined) {
  const label = value?.trim();

  if (!label) return undefined;

  return {
    id: label,
    label,
  };
}
