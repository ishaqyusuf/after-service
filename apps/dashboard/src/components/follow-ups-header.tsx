import { FollowUpSearchFilter } from "./follow-up-search-filter";
import { FollowUpsColumnVisibility } from "./follow-ups-column-visibility";
import { OpenFollowUpSheet } from "./open-follow-up-sheet";
import { PageHeader, PageToolbar } from "./page-header";

export async function FollowUpsHeader() {
  return (
    <PageHeader
      title="Follow-ups"
      description="Every check-in, from due to closed."
      actions={<OpenFollowUpSheet />}
    >
      <PageToolbar>
        <FollowUpSearchFilter />
        <FollowUpsColumnVisibility />
      </PageToolbar>
    </PageHeader>
  );
}
