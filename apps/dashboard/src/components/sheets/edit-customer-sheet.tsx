"use client";

import { updateCustomerSchema } from "@afterservice/api/schemas";
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
import { useQueryState } from "nuqs";
import { useZodForm } from "@/hooks/use-zod-form";
import { useEffect } from "react";
import { SheetFormSkeleton } from "./sheet-form-skeleton";

export function EditCustomerSheet() {
  const [customerId, setCustomerId] = useQueryState("edit_customer");
  
  const { data: customerData, isLoading } = trpc.customers.get.useQuery(
    { id: customerId! },
    { enabled: !!customerId }
  );

  const form = useZodForm({
    schema: updateCustomerSchema,
    defaultValues: {
      id: "",
      name: "",
      email: "",
      phone: "",
      companyName: "",
      tags: "",
      notes: "",
    }
  });

  useEffect(() => {
    if (customerData?.item) {
      form.reset({
        id: customerData.item.id,
        name: customerData.item.name,
        email: customerData.item.email || "",
        phone: customerData.item.phone || "",
        companyName: customerData.item.companyName || "",
        tags: customerData.item.tags.join(", "),
        notes: customerData.item.notes || "",
      });
    }
  }, [customerData, form]);

  const utils = trpc.useUtils();
  const updateCustomer = trpc.customers.update.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      utils.customers.get.invalidate({ id: customerId! });
      setCustomerId(null);
    },
  });

  const archiveCustomer = trpc.customers.archive.useMutation({
    onSuccess: () => {
      utils.customers.list.invalidate();
      setCustomerId(null);
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) setCustomerId(null);
  };

  return (
    <Sheet open={!!customerId} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>Update customer details or archive this record.</SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <SheetFormSkeleton fields={6} />
        ) : (
          <div className="mt-6 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  updateCustomer.mutate(data),
                )}
                className="space-y-4"
              >
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
                        <Input {...field} />
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
                        <Textarea className="h-32" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={updateCustomer.isPending}
                  className="w-full"
                >
                  {updateCustomer.isPending ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </Form>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="destructive" 
                className="w-full"
                disabled={archiveCustomer.isPending}
                onClick={() => customerId && archiveCustomer.mutate({ id: customerId })}
              >
                {archiveCustomer.isPending ? "Archiving..." : "Archive Customer"}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
