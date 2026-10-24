import { Skeleton } from "@afterservice/ui";

const daySkeletons = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"];
const rowSkeletons = ["r1", "r2", "r3", "r4"];

export function OverviewSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-5 md:gap-6">
      <output className="sr-only">Loading overview</output>
      <div aria-hidden="true" className="grid gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full max-w-[420px]" />
      </div>
      <div
        aria-hidden="true"
        className="grid items-start gap-4 min-[1100px]:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
      >
        <div className="overflow-hidden rounded-[14px] border border-border bg-card min-[1100px]:col-span-2">
          <div className="border-b border-border px-5 py-3.5">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7">
            {daySkeletons.map((key) => (
              <div
                key={key}
                className="flex gap-3 border-b border-border px-4 py-3 last:border-b-0 md:min-h-[148px] md:flex-col md:border-b-0 md:border-r md:px-2.5 md:last:border-r-0"
              >
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-7 flex-1 md:w-full md:flex-none" />
              </div>
            ))}
          </div>
        </div>
        <SkeletonPanel rows={rowSkeletons} />
        <div className="grid gap-4">
          <SkeletonPanel rows={rowSkeletons.slice(0, 2)} />
          <SkeletonPanel rows={rowSkeletons.slice(0, 2)} />
        </div>
      </div>
    </div>
  );
}

function SkeletonPanel({ rows }: { rows: string[] }) {
  return (
    <div className="grid gap-4 rounded-[14px] border border-border bg-card px-5 py-[18px]">
      <Skeleton className="h-5 w-32" />
      {rows.map((key) => (
        <div key={key} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
