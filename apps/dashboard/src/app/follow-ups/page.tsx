import {
  Badge,
  Button,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from "@afterservice/ui";
import {
  closeFollowUpAction,
  createFollowUpAction,
  markFollowUpRepliedAction,
  markFollowUpSentAction,
  rescheduleFollowUpAction,
} from "@/lib/dashboard-actions";
import {
  formatDate,
  getFollowUpsData,
  resolveTemplate,
} from "@/lib/dashboard-data";

type BoardItem = Awaited<
  ReturnType<typeof getFollowUpsData>
>["followUps"][number];

export default async function FollowUpsPage() {
  const { columns, customers, jobs, templates, workspace } =
    await getFollowUpsData();
  const defaultDue = new Date(
    Date.now() + workspace.defaultFollowUpDelayDays * 86400000,
  )
    .toISOString()
    .slice(0, 10);

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge>Core board</Badge>
        <div>
          <h1>Follow-ups</h1>
          <p>
            Work every post-service check-in from due, upcoming, waiting,
            replied, and closed states.
          </p>
        </div>
        <a href="/templates">Manage templates</a>
      </header>

      <section className="dashboard-split">
        <form action={createFollowUpAction} className="dashboard-form">
          <h2>Create follow-up</h2>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="follow-up-customer">Customer</FieldLabel>
              <Select id="follow-up-customer" name="customerId" required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="follow-up-job">Related job</FieldLabel>
              <Select id="follow-up-job" name="jobId">
                <option value="">No job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="follow-up-template">Template</FieldLabel>
              <Select id="follow-up-template" name="templateId">
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="follow-up-channel">Channel</FieldLabel>
              <Select
                id="follow-up-channel"
                name="channel"
                defaultValue="email"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="follow-up-due-at">Due date</FieldLabel>
              <Input
                id="follow-up-due-at"
                defaultValue={defaultDue}
                name="dueAt"
                required
                type="date"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="follow-up-notes">Draft / notes</FieldLabel>
              <Textarea id="follow-up-notes" name="notes" />
            </Field>
          </FieldGroup>
          <Button disabled={customers.length === 0} type="submit">
            Add to board
          </Button>
        </form>

        <section className="board-grid" aria-label="Follow-up board">
          <BoardColumn title="Due today" items={columns.dueToday} />
          <BoardColumn title="Upcoming" items={columns.upcoming} />
          <BoardColumn title="Waiting" items={columns.waiting} />
          <BoardColumn title="Replied" items={columns.replied} />
          <BoardColumn title="Closed" items={columns.closed} />
        </section>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <h2>Follow-up table</h2>
        </div>
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
            {[
              ...columns.dueToday,
              ...columns.upcoming,
              ...columns.waiting,
              ...columns.replied,
              ...columns.closed,
            ].map((followUp) => (
              <TableRow key={followUp.id}>
                <TableCell>{followUp.customerName}</TableCell>
                <TableCell>{followUp.serviceTitle ?? "General"}</TableCell>
                <TableCell>
                  <Badge>{followUp.status}</Badge>
                </TableCell>
                <TableCell>{formatDate(followUp.dueAt)}</TableCell>
                <TableCell>
                  {followUp.events[0]?.type ?? "created"}{" "}
                  {followUp.events[0]
                    ? `on ${formatDate(followUp.events[0].createdAt)}`
                    : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}

function BoardColumn({ items, title }: { items: BoardItem[]; title: string }) {
  return (
    <div className="board-column">
      <h2>
        {title} <span>{items.length}</span>
      </h2>
      {items.map((item) => (
        <FollowUpCard item={item} key={item.id} />
      ))}
      {items.length === 0 ? <p className="muted">No cards.</p> : null}
    </div>
  );
}

function FollowUpCard({ item }: { item: BoardItem }) {
  const recipient =
    item.channel === "email" ? "customer@example.com" : "manual";
  const body = resolveTemplate(
    item.notes ?? "Checking in after your service.",
    {
      businessName: "afterservice",
      customerName: item.customerName,
      serviceName: item.serviceTitle,
    },
  );

  return (
    <article className="board-card">
      <div className="board-card__top">
        <strong>{item.customerName}</strong>
        <Badge tone={item.status === "sent" ? "warning" : "neutral"}>
          {item.channel}
        </Badge>
      </div>
      <p>{item.serviceTitle ?? "General check-in"}</p>
      <span className="muted-block">Due {formatDate(item.dueAt)}</span>
      <details className="inline-details">
        <summary>Work</summary>
        <form action={rescheduleFollowUpAction} className="mini-form">
          <input name="id" type="hidden" value={item.id} />
          <Input
            defaultValue={new Date(item.dueAt).toISOString().slice(0, 10)}
            name="dueAt"
            type="date"
          />
          <Button size="sm" type="submit" variant="secondary">
            Reschedule
          </Button>
        </form>
        <form action={markFollowUpSentAction} className="mini-form">
          <input name="id" type="hidden" value={item.id} />
          <Input name="recipient" defaultValue={recipient} />
          <Input name="subject" defaultValue="Checking in after your service" />
          <Textarea name="body" defaultValue={body} />
          <Button size="sm" type="submit">
            Log manual send
          </Button>
        </form>
        <form action={markFollowUpRepliedAction} className="mini-form">
          <input name="id" type="hidden" value={item.id} />
          <Input name="notes" placeholder="Reply summary" />
          <Button size="sm" type="submit" variant="secondary">
            Mark replied
          </Button>
        </form>
        <form action={closeFollowUpAction} className="mini-form">
          <input name="id" type="hidden" value={item.id} />
          <Input name="notes" placeholder="Closure note" />
          <Button size="sm" type="submit" variant="ghost">
            Close
          </Button>
        </form>
      </details>
    </article>
  );
}
