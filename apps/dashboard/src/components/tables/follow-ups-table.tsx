import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { formatDate } from "@/lib/dashboard-data";

export function FollowUpsTable({ items }: { items: any[] }) {
  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Last event</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((followUp) => (
            <TableRow key={followUp.id}>
              <TableCell className="font-medium">{followUp.customerName}</TableCell>
              <TableCell>{followUp.serviceTitle ?? "General"}</TableCell>
              <TableCell>
                <Badge variant={followUp.status === "sent" ? "default" : "secondary"}>
                  {followUp.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(followUp.dueAt)}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {followUp.events[0]?.type ?? "created"}{" "}
                {followUp.events[0]
                  ? `on ${formatDate(followUp.events[0].createdAt)}`
                  : ""}
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No follow-ups found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
