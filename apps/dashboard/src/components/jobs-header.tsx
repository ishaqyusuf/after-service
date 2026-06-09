import { JobsColumnVisibility } from "./jobs-column-visibility";
import { JobsSearchFilter } from "./jobs-search-filter";
import { OpenJobSheet } from "./open-job-sheet";

export async function JobsHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <JobsSearchFilter />

      <div className="flex items-center gap-2">
        <JobsColumnVisibility />
        <div className="hidden sm:block">
          <OpenJobSheet />
        </div>
      </div>
    </div>
  );
}
