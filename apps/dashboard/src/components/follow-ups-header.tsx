import { FollowUpsColumnVisibility } from "./follow-ups-column-visibility";
import { OpenFollowUpSheet } from "./open-follow-up-sheet";
import { FollowUpSearchFilter } from "./follow-up-search-filter";

export async function FollowUpsHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <FollowUpSearchFilter />

      <div className="flex items-center gap-2">
        <FollowUpsColumnVisibility />
        <div className="hidden sm:block">
          <OpenFollowUpSheet />
        </div>
      </div>
    </div>
  );
}
