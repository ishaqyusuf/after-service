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
  createFollowUpFromJobAction,
  createJobAction,
} from "@/lib/dashboard-actions";
import { centsToDollars, formatDate, getJobsData } from "@/lib/dashboard-data";

export default async function JobsPage() {
  const { customers, jobs, templates, workspace } = await getJobsData();
  const defaultDue = new Date(
    Date.now() + workspace.defaultFollowUpDelayDays * 86400000,
  )
    .toISOString()
    .slice(0, 10);

  return (
    <main className="dashboard-page">
      <header className="dashboard-page__header">
        <Badge>Service jobs</Badge>
        <div>
          <h1>Jobs</h1>
          <p>
            Log completed work and turn it into follow-up actions using the
            workspace default cadence.
          </p>
        </div>
        <a href="/follow-ups">Open board</a>
      </header>

      <section className="dashboard-split">
        <form action={createJobAction} className="dashboard-form">
          <h2>Log completed job</h2>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="job-customer">Customer</FieldLabel>
              <Select id="job-customer" name="customerId" required>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="job-title">Service title</FieldLabel>
              <Input id="job-title" name="title" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-category">Category</FieldLabel>
              <Input
                id="job-category"
                name="serviceCategory"
                placeholder="HVAC maintenance"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-completed-at">Completed date</FieldLabel>
              <Input
                id="job-completed-at"
                defaultValue={new Date().toISOString().slice(0, 10)}
                name="completedAt"
                required
                type="date"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-amount">Amount</FieldLabel>
              <Input
                id="job-amount"
                name="amountDollars"
                placeholder="250"
                type="number"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-next-follow-up">
                Next follow-up
              </FieldLabel>
              <Input
                id="job-next-follow-up"
                defaultValue={defaultDue}
                name="nextFollowUpAt"
                type="date"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="job-notes">Notes</FieldLabel>
              <Textarea id="job-notes" name="notes" />
            </Field>
          </FieldGroup>
          <Button disabled={customers.length === 0} type="submit">
            Create job
          </Button>
        </form>

        <section className="dashboard-section">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Follow-up</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <strong>{job.title}</strong>
                    <span className="muted-block">
                      {job.serviceCategory ?? job.status}
                    </span>
                  </TableCell>
                  <TableCell>{job.customer.name}</TableCell>
                  <TableCell>{formatDate(job.completedAt)}</TableCell>
                  <TableCell>
                    {centsToDollars(job.amountCents) || "Unset"}
                  </TableCell>
                  <TableCell>
                    <details className="inline-details">
                      <summary>Schedule</summary>
                      <form
                        action={createFollowUpFromJobAction}
                        className="mini-form"
                      >
                        <input name="jobId" type="hidden" value={job.id} />
                        <Input
                          defaultValue={defaultDue}
                          name="dueAt"
                          type="date"
                        />
                        <Select name="channel" defaultValue="email">
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                          <option value="phone">Phone</option>
                          <option value="whatsapp">WhatsApp</option>
                        </Select>
                        <Select name="templateId">
                          <option value="">No template</option>
                          {templates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </Select>
                        <Textarea
                          name="notes"
                          defaultValue={`Follow up about ${job.title}.`}
                        />
                        <Button size="sm" type="submit">
                          Create follow-up
                        </Button>
                      </form>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    No jobs yet. Create a customer, then log completed work.
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
