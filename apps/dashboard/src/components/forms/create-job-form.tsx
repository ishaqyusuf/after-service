import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { createJobAction } from "@/lib/dashboard-actions";

export function CreateJobForm({ customers, defaultDue }: { customers: any[], defaultDue: string }) {
  return (
    <form action={createJobAction} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Log completed job</h2>
        <p className="text-sm text-muted-foreground">Log completed work and setup follow-ups.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job-customer">Customer</Label>
          <select 
            id="job-customer" 
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
          <Label htmlFor="job-title">Service title</Label>
          <Input id="job-title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-category">Category</Label>
          <Input
            id="job-category"
            name="serviceCategory"
            placeholder="HVAC maintenance"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-completed-at">Completed date</Label>
          <Input
            id="job-completed-at"
            defaultValue={new Date().toISOString().slice(0, 10)}
            name="completedAt"
            required
            type="date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-amount">Amount</Label>
          <Input
            id="job-amount"
            name="amountDollars"
            placeholder="250"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-next-follow-up">Next follow-up</Label>
          <Input
            id="job-next-follow-up"
            defaultValue={defaultDue}
            name="nextFollowUpAt"
            type="date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-notes">Notes</Label>
          <Textarea id="job-notes" name="notes" />
        </div>
      </div>
      <Button disabled={customers.length === 0} type="submit" className="w-full">
        Create job
      </Button>
    </form>
  );
}
