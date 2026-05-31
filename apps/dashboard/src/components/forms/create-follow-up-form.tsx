import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { createFollowUpAction } from "@/lib/dashboard-actions";

export function CreateFollowUpForm({ customers, jobs, templates, defaultDue }: { customers: any[], jobs: any[], templates: any[], defaultDue: string }) {
  return (
    <form action={createFollowUpAction} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Create follow-up</h2>
        <p className="text-sm text-muted-foreground">Setup manual or template-based follow ups.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="follow-up-customer">Customer</Label>
          <select 
            id="follow-up-customer" 
            name="customerId" 
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-job">Related job</Label>
          <select 
            id="follow-up-job" 
            name="jobId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">No job</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-template">Template</Label>
          <select 
            id="follow-up-template" 
            name="templateId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">No template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-channel">Channel</Label>
          <select
            id="follow-up-channel"
            name="channel"
            defaultValue="email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-due-at">Due date</Label>
          <Input
            id="follow-up-due-at"
            defaultValue={defaultDue}
            name="dueAt"
            required
            type="date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="follow-up-notes">Draft / notes</Label>
          <Textarea id="follow-up-notes" name="notes" className="resize-y" />
        </div>
      </div>
      <Button disabled={customers.length === 0} type="submit" className="w-full">
        Add to board
      </Button>
    </form>
  );
}
