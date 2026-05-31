import { Badge, Button, Input } from "@afterservice/ui";
import { CreateCustomerForm } from "@/components/forms/create-customer-form";
import { CustomersTable } from "@/components/tables/customers-table";
import Link from "next/link";
import { Suspense } from "react";

type CustomersPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2">Customer management</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground max-w-2xl">
            Maintain the customer base that jobs, follow-ups, messages, and
            repeat-business prompts attach to.
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs">Log job</Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        <CreateCustomerForm />

        <section className="space-y-4 min-w-0">
          <form className="flex items-center gap-2" action="/customers">
            <Input
              defaultValue={params?.q ?? ""}
              name="q"
              placeholder="Search customers..."
              className="max-w-md"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
            <CustomersTable />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

