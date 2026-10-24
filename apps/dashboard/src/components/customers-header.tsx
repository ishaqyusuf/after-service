import { CustomersColumnVisibility } from "./customers-column-visibility";
import { CustomersSearchFilter } from "./customers-search-filter";
import { OpenCustomerSheet } from "./open-customer-sheet";
import { PageHeader, PageToolbar } from "./page-header";

export async function CustomersHeader() {
  return (
    <PageHeader
      title="Customers"
      description="Everyone you've done work for, with their jobs, follow-ups and replies kept together."
      actions={<OpenCustomerSheet />}
    >
      <PageToolbar>
        <CustomersSearchFilter />
        <CustomersColumnVisibility />
      </PageToolbar>
    </PageHeader>
  );
}
