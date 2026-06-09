"use client";

import { createCustomerSchema } from "@afterservice/api/schemas";
import {
  Button,
  Input,
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
          <SheetDescription>
            Create a customer profile for service history and follow-ups.
          </SheetDescription>
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
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="warranty, vip" {...field} />
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
                      <FormLabel>Notes</FormLabel>
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
