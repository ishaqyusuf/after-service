"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@afterservice/ui";
import { CustomerCreateForm } from "@/components/forms/customer-create-form";
import { useCustomerParams } from "@/hooks/use-customer-params";

export function CustomerCreateSheet() {
  const { createCustomer, setParams } = useCustomerParams();

  return (
    <Sheet
      open={createCustomer ?? false}
      onOpenChange={(isOpen) =>
        setParams({ createCustomer: isOpen ? true : null })
      }
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add customer</SheetTitle>
          <SheetDescription>
            Create a customer profile for service history and follow-ups.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6">
          <CustomerCreateForm />
        </div>
      </SheetContent>
    </Sheet>
  );
}
