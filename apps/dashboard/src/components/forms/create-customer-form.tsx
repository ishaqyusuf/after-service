"use client";

import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";

const createCustomerSchema = z.object({
  companyName: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name is required"),
  notes: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

export function CreateCustomerForm() {
  const form = useZodForm({
    schema: createCustomerSchema,
  });

  const utils = trpc.useUtils();
  const createCustomer = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      form.reset();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => createCustomer.mutate(data))}
      className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md"
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Add customer</h2>
        <p className="text-sm text-muted-foreground">Add a new customer to your workspace.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Name</Label>
          <Input id="customer-name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input id="customer-phone" {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input id="customer-email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-company">Company</Label>
          <Input id="customer-company" {...form.register("companyName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-tags">Tags</Label>
          <Input
            id="customer-tags"
            placeholder="warranty, vip"
            {...form.register("tags")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-notes">Notes</Label>
          <Textarea id="customer-notes" className="resize-y" {...form.register("notes")} />
        </div>
      </div>
      <Button type="submit" disabled={createCustomer.isPending} className="w-full">
        {createCustomer.isPending ? "Creating..." : "Create customer"}
      </Button>
    </form>
  );
}
