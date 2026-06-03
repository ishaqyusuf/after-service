import { TemplatesColumnVisibility } from "./templates-column-visibility";
import { OpenTemplateSheet } from "./open-template-sheet";
import { SearchField } from "./search-field";

export async function TemplatesHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <SearchField placeholder="Search templates..." />

      <div className="flex items-center gap-2">
        <TemplatesColumnVisibility />
        <div className="hidden sm:block">
          <OpenTemplateSheet />
        </div>
      </div>
    </div>
  );
}
