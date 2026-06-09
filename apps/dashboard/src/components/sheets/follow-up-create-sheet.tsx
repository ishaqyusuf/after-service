"use client";

import { createFollowUpSchema } from "@afterservice/api/schemas";
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
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useZodForm } from "@/hooks/use-zod-form";

const channelOptions = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Phone", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
] as const;

const EMPTY_OPTION_VALUE = "__empty__";

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
          <SheetDescription>
            Schedule the next customer touchpoint after a completed service.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createFollowUpMutation.mutate({
                  ...data,
                  jobId: data.jobId || undefined,
                  templateId: data.templateId || undefined,
                }),
              )}
              className="space-y-6"
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select
                        disabled={isLoadingCustomers}
                        onValueChange={field.onChange}
                        value={field.value || undefined}
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
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
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
                  name="jobId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related job</FormLabel>
                      <Select
                        disabled={isLoadingJobs}
                        onValueChange={(value) =>
                          field.onChange(
                            value === EMPTY_OPTION_VALUE ? "" : value,
                          )
                        }
                        value={field.value || EMPTY_OPTION_VALUE}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingJobs ? "Loading jobs..." : "No job"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={EMPTY_OPTION_VALUE}>
                            No job
                          </SelectItem>
                          {jobs.map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title}
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
                        disabled={isLoadingTemplates}
                        onValueChange={(value) =>
                          field.onChange(
                            value === EMPTY_OPTION_VALUE ? "" : value,
                          )
                        }
                        value={field.value || EMPTY_OPTION_VALUE}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoadingTemplates
                                  ? "Loading templates..."
                                  : "No template"
                              }
                            />
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Draft / notes</FormLabel>
                      <FormControl>
                        <Textarea className="resize-y" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  customers.length === 0 || createFollowUpMutation.isPending
                }
              >
                {createFollowUpMutation.isPending ? "Adding..." : "Add to board"}
              </Button>
            </form>
          </Form>
        </div>
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
