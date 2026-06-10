"use client";

import { Sheet } from "@afterservice/ui";
import { CustomerEditForm } from "@/components/forms/customer-edit-form";
import { trpc } from "@/components/providers/trpc-provider";
import { useCustomerParams } from "@/hooks/use-customer-params";
import { DashboardSheetContent } from "./dashboard-sheet-content";
import { SheetFormSkeleton } from "./sheet-form-skeleton";
import { SheetMissingState } from "./sheet-missing-state";

export function EditCustomerSheet() {
  const { customerId, setParams } = useCustomerParams();

  const { data: customerData, isLoading } = trpc.customers.get.useQuery(
    { id: customerId! },
    { enabled: !!customerId },
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) setParams(null);
  };

  return (
    <Sheet open={!!customerId} onOpenChange={handleOpenChange}>
      <DashboardSheetContent
        bodyClassName=""
        title="Edit customer"
        description="Update customer details or archive this record."
      >
        {isLoading ? (
          <SheetFormSkeleton fields={6} />
        ) : customerData?.item ? (
          <CustomerEditForm customer={customerData.item} />
        ) : (
          <SheetMissingState
            title="Customer not found"
            description="This customer may have been archived or removed."
            onClose={() => setParams(null)}
          />
        )}
      </DashboardSheetContent>
    </Sheet>
  );
}
