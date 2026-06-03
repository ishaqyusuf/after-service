import { JobsColumnVisibility } from "./jobs-column-visibility";
import { OpenJobSheet } from "./open-job-sheet";
import { SearchField } from "./search-field";

export async function JobsHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <SearchField placeholder="Search jobs..." />

      <div className="flex items-center gap-2">
        <JobsColumnVisibility />
        <div className="hidden sm:block">
          <OpenJobSheet />
        </div>
      </div>
    </div>
  );
}
