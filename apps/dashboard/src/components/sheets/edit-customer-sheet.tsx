"use client";

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useQueryState } from "nuqs";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useEffect } from "react";

const updateCustomerSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name is required"),
  notes: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  tags: z.string().trim().optional(),
});

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
          <div className="mt-6 flex justify-center py-8">Loading...</div>
        ) : (
          <div className="mt-6 space-y-6">
            <form onSubmit={form.handleSubmit((data) => updateCustomer.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...form.register("email")} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input {...form.register("companyName")} />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input {...form.register("tags")} />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea className="h-32" {...form.register("notes")} />
              </div>
              <Button type="submit" disabled={updateCustomer.isPending} className="w-full">
                {updateCustomer.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>

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
