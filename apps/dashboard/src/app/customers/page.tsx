import {
  Badge,
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@afterservice/ui";
import {
  archiveCustomerAction,
  createCustomerAction,
  updateCustomerAction,
} from "@/lib/dashboard-actions";
import { formatDate, getCustomers } from "@/lib/dashboard-data";

type CustomersPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const customers = await getCustomers(params?.q);

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge>Customer management</Badge>
        <div>
          <h1>Customers</h1>
          <p>
            Maintain the customer base that jobs, follow-ups, messages, and
            repeat-business prompts attach to.
          </p>
        </div>
        <a href="/jobs">Log job</a>
      </header>

      <section className="dashboard-split">
        <form action={createCustomerAction} className="dashboard-form">
          <h2>Add customer</h2>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="customer-name">Name</FieldLabel>
              <Input id="customer-name" name="name" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
              <Input id="customer-phone" name="phone" />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-email">Email</FieldLabel>
              <Input id="customer-email" name="email" type="email" />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-company">Company</FieldLabel>
              <Input id="customer-company" name="companyName" />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-tags">Tags</FieldLabel>
              <Input
                id="customer-tags"
                name="tags"
                placeholder="warranty, vip"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="customer-notes">Notes</FieldLabel>
              <Textarea id="customer-notes" name="notes" />
            </Field>
          </FieldGroup>
          <Button type="submit">Create customer</Button>
        </form>

        <section className="dashboard-section">
          <form className="toolbar" action="/customers">
            <Input
              defaultValue={params?.q ?? ""}
              name="q"
              placeholder="Search customers"
            />
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last service</TableHead>
                <TableHead>Open follow-ups</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <strong>{customer.name}</strong>
                    <span className="muted-block">
                      {customer.companyName ?? customer.tags.join(", ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    {customer.email ?? customer.phone ?? "No contact"}
                  </TableCell>
                  <TableCell>{formatDate(customer.lastServiceAt)}</TableCell>
                  <TableCell>{customer.openFollowUpCount}</TableCell>
                  <TableCell>
                    <details className="inline-details">
                      <summary>Edit</summary>
                      <form action={updateCustomerAction} className="mini-form">
                        <input name="id" type="hidden" value={customer.id} />
                        <Input name="name" defaultValue={customer.name} />
                        <Input
                          name="email"
                          defaultValue={customer.email ?? ""}
                          type="email"
                        />
                        <Input
                          name="phone"
                          defaultValue={customer.phone ?? ""}
                        />
                        <Input
                          name="companyName"
                          defaultValue={customer.companyName ?? ""}
                        />
                        <Input
                          name="tags"
                          defaultValue={customer.tags.join(", ")}
                        />
                        <Textarea
                          name="notes"
                          defaultValue={customer.notes ?? ""}
                        />
                        <div className="button-row">
                          <Button size="sm" type="submit">
                            Save
                          </Button>
                        </div>
                      </form>
                      <form action={archiveCustomerAction}>
                        <input name="id" type="hidden" value={customer.id} />
                        <Button size="sm" type="submit" variant="ghost">
                          Archive
                        </Button>
                      </form>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    No customers match this view.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </section>
      </section>
    </main>
  );
}
