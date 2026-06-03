"use client";

import { Button } from "@afterservice/ui";
import { useCustomerParams } from "@/hooks/use-customer-params";

export function EmptyState() {
  const { setParams } = useCustomerParams();

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center mt-40">
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">No follow-ups found</h2>
          <p className="text-[#606060] text-sm">
            You don't have any follow-ups yet. <br />
            Go ahead and create your first one.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setParams({
              createCustomer: true,
            })
          }
        >
          Create customer
        </Button>
      </div>
    </div>
  );
}

export function NoResults() {
  const { setParams } = useCustomerParams();

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center mt-40">
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">No results</h2>
          <p className="text-[#606060] text-sm">
            We couldn't find any follow-ups matching your criteria. Try adjusting
            your filters or search query.
          </p>
        </div>

        <Button variant="outline" onClick={() => setParams(null)}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
