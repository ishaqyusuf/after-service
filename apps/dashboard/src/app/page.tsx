import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@afterservice/ui";
import { formatDate, getDashboardOverview } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const { counts, recentFollowUps, workspace } = await getDashboardOverview();

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge tone="success">Workspace live</Badge>
        <div>
          <h1>{workspace.name}</h1>
          <p>
            Today&apos;s after-service work, customer base, job history, and
            billing state in one operator view.
          </p>
        </div>
        <a href="/follow-ups">Work board</a>
      </header>

      <section className="metric-grid" aria-label="Workspace metrics">
        <Metric label="Customers" value={counts.customers} />
        <Metric label="Completed jobs" value={counts.jobs} />
        <Metric label="Open follow-ups" value={counts.openFollowUps} />
        <Metric label="Due today" value={counts.dueToday} />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Priority follow-ups</h2>
          <a href="/follow-ups">View all</a>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentFollowUps.map((followUp) => (
              <TableRow key={followUp.id}>
                <TableCell>{followUp.customerName}</TableCell>
                <TableCell>
                  {followUp.serviceTitle ?? "General check-in"}
                </TableCell>
                <TableCell>
                  <Badge
                    tone={followUp.status === "sent" ? "warning" : "neutral"}
                  >
                    {followUp.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(followUp.dueAt)}</TableCell>
              </TableRow>
            ))}
            {recentFollowUps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No open follow-ups yet.</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
