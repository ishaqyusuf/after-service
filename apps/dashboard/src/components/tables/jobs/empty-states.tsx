"use client";

import { Button } from "@afterservice/ui";
import { useJobParams } from "@/hooks/use-job-params";

export function EmptyState() {
  const { setParams } = useJobParams();

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center mt-40">
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">No jobs</h2>
          <p className="text-[#606060] text-sm">
            You haven't created any jobs yet. <br />
            Go ahead and create your first one.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setParams({
              createJob: true,
            })
          }
        >
          Create job
        </Button>
      </div>
    </div>
  );
}

export function NoResults() {
  const { setParams } = useJobParams();

  return (
    <div className="flex items-center justify-center ">
      <div className="flex flex-col items-center mt-40">
        <div className="text-center mb-6 space-y-2">
          <h2 className="font-medium text-lg">No results</h2>
          <p className="text-[#606060] text-sm">
            Try another search, or adjusting the filters
          </p>
        </div>

        <Button variant="outline" onClick={() => setParams(null)}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
