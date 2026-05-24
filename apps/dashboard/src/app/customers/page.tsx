import { PageShell } from "@/lib/page-shell";

export default function CustomersPage() {
  return (
    <PageShell
      actionHref="/jobs"
      actionLabel="View jobs"
      description="Customer list, filters, and detail views will land in the customer MVP phase."
      title="Customers"
    />
  );
}
