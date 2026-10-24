"use client";

import { Button } from "@afterservice/ui/button";
import { Icons } from "@afterservice/ui/icons";
import { PAGE_ACTION_CLASS } from "@/components/page-header";
import { useCustomerParams } from "@/hooks/use-customer-params";

export function OpenCustomerSheet() {
  const { setParams } = useCustomerParams();

  return (
    <Button
      className={PAGE_ACTION_CLASS}
      onClick={() => setParams({ createCustomer: true })}
    >
      <Icons.Add />
      <span>Add customer</span>
    </Button>
  );
}
