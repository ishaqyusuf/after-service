"use client";

import { createJobSchema } from "@afterservice/api/schemas";
import {
  Button,
  Calendar,
  ComboboxDropdown,
  type ComboboxItem,
  CurrencyInput,
  Icons,
  Popover,
  PopoverContent,
  PopoverTrigger,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useMemo } from "react";
import type { z } from "zod";
import { QuickFill } from "@/components/quick-fill";
import { useJobParams } from "@/hooks/use-job-params";
import { useZodForm } from "@/hooks/use-zod-form";
import { useTRPC } from "@/trpc/client";

export function JobCreateForm() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { setParams } = useJobParams();

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery(
    trpc.customers.list.queryOptions({
      includeArchived: false,
      limit: 100,
    }),
  );
  const customers = customersData?.items ?? [];
  const { data: jobsData } = useQuery(
    trpc.serviceJobs.list.queryOptions({ limit: 100 }),
  );
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

  const createCustomerMutation = useMutation(
    trpc.customers.create.mutationOptions({
      onSuccess: ({ item }) => {
        queryClient.invalidateQueries({
          queryKey: trpc.customers.list.queryKey(),
        });
        form.setValue("customerId", item.id, {
          shouldDirty: true,
          shouldValidate: true,
        });
      },
    }),
  );
  const createJobMutation = useMutation(
    trpc.serviceJobs.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.serviceJobs.list.queryKey(),
        });
        form.reset();
        setParams({ createJob: null });
      },
    }),
  );

  const onSubmit = (data: z.infer<typeof createJobSchema>) => {
    createJobMutation.mutate({
      ...data,
      amountCents: data.amountDollars
        ? Math.round(data.amountDollars * 100)
        : undefined,
    });
  };

  return (
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
                  disabled={
                    isLoadingCustomers || createCustomerMutation.isPending
                  }
                  placeholder="Select or create customer"
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
                  onCreate={(value) => {
                    const title = value.trim();

                    if (title) {
                      field.onChange(title);
                    }
                  }}
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
                  onCreate={(value) => {
                    const category = value.trim();

                    if (category) {
                      field.onChange(category);
                    }
                  }}
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
                        field.value instanceof Date ? field.value : undefined
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
                  <CurrencyInput
                    placeholder="250"
                    value={field.value ?? ""}
                    onValueChange={(values) => {
                      field.onChange(values.floatValue);
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
                        field.value instanceof Date ? field.value : undefined
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
