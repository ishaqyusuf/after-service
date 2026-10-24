import { OpenTemplateSheet } from "./open-template-sheet";
import { PageHeader, PageToolbar } from "./page-header";
import { TemplatesColumnVisibility } from "./templates-column-visibility";
import { TemplatesSearchFilter } from "./templates-search-filter";

export async function TemplatesHeader() {
  return (
    <PageHeader
      title="Templates"
      description="Reusable wording for common check-in messages."
      actions={<OpenTemplateSheet />}
    >
      <PageToolbar>
        <TemplatesSearchFilter />
        <TemplatesColumnVisibility />
      </PageToolbar>
    </PageHeader>
  );
}
