import { JobsColumnVisibility } from "./jobs-column-visibility";
import { JobsSearchFilter } from "./jobs-search-filter";
import { OpenJobSheet } from "./open-job-sheet";
import { PageHeader, PageToolbar } from "./page-header";

export async function JobsHeader() {
  return (
    <PageHeader
      title="Jobs"
      description="Completed work, each linked to its customer."
      actions={<OpenJobSheet />}
    >
      <PageToolbar>
        <JobsSearchFilter />
        <JobsColumnVisibility />
      </PageToolbar>
    </PageHeader>
  );
}
