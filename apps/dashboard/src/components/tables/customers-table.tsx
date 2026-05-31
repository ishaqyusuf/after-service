import {
  Badge,
  Button,
  Input,
  Label,
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
  updateCustomerAction,
} from "@/lib/dashboard-actions";
import { formatDate } from "@/lib/dashboard-format";
import { CustomerSheet } from "../sheets/customer-sheet";

// Assuming Customer type exists or just using any for now in standard refactor
export function CustomersTable({ customers }: { customers: any[] }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Last service</TableHead>
            <TableHead>Open follow-ups</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <div className="font-semibold">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.companyName ?? customer.tags.join(", ")}
                </div>
              </TableCell>
              <TableCell>
                {customer.email ?? customer.phone ?? "No contact"}
              </TableCell>
              <TableCell>{formatDate(customer.lastServiceAt)}</TableCell>
              <TableCell>{customer.openFollowUpCount}</TableCell>
              <TableCell>
                <CustomerSheet customer={customer} />
              </TableCell>
            </TableRow>
          ))}
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No customers match this view.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
