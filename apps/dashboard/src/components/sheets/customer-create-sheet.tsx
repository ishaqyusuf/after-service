"use client";

import { createCustomerSchema } from "@afterservice/api/schemas";
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
import { trpc } from "@/components/providers/trpc-provider";
import { QuickFill } from "@/components/quick-fill";
import { useCustomerParams } from "@/hooks/use-customer-params";
import { useZodForm } from "@/hooks/use-zod-form";

export function CustomerCreateSheet() {
  const { createCustomer, setParams } = useCustomerParams();

  const form = useZodForm({
    schema: createCustomerSchema,
  });

  const utils = trpc.useUtils();
  const createCustomerMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      form.reset();
      setParams({ createCustomer: null });
    },
  });

  return (
    <Sheet
      open={createCustomer ?? false}
      onOpenChange={(isOpen) =>
        setParams({ createCustomer: isOpen ? true : null })
      }
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) =>
                createCustomerMutation.mutate(data),
              )}
              className="space-y-6"
            >
              <div className="flex justify-end">
                <QuickFill name="customer" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Name</Label>
                  <Input id="customer-name" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Phone</Label>
                  <Input id="customer-phone" {...form.register("phone")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    {...form.register("email")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-company">Company</Label>
                  <Input
                    id="customer-company"
                    {...form.register("companyName")}
                  />
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
                  <Textarea
                    id="customer-notes"
                    className="resize-y"
                    {...form.register("notes")}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={createCustomerMutation.isPending}
                className="w-full"
              >
                {createCustomerMutation.isPending
                  ? "Creating..."
                  : "Create customer"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
