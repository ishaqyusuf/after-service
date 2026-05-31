import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { createCustomerAction } from "@/lib/dashboard-actions";

export function CreateCustomerForm() {
  return (
    <form action={createCustomerAction} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Add customer</h2>
        <p className="text-sm text-muted-foreground">Add a new customer to your workspace.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Name</Label>
          <Input id="customer-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Phone</Label>
          <Input id="customer-phone" name="phone" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email</Label>
          <Input id="customer-email" name="email" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-company">Company</Label>
          <Input id="customer-company" name="companyName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-tags">Tags</Label>
          <Input
            id="customer-tags"
            name="tags"
            placeholder="warranty, vip"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-notes">Notes</Label>
          <Textarea id="customer-notes" name="notes" className="resize-y" />
        </div>
      </div>
      <Button type="submit" className="w-full">Create customer</Button>
    </form>
  );
}
