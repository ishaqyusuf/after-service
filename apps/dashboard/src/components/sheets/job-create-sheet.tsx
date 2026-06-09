"use client";

import { createJobSchema } from "@afterservice/api/schemas";
import {
  Button,
  Calendar,
  Icons,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingCustomers}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingCustomers
                                  ? "Loading customers..."
                                  : "Select customer"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {customers.map((customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                      <FormControl>
                        <Input placeholder="HVAC maintenance" {...field} />
                      </FormControl>
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
