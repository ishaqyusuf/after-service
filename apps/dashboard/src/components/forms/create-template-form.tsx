import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { createTemplateAction } from "@/lib/dashboard-actions";

export function CreateTemplateForm() {
  return (
    <form action={createTemplateAction} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Create template</h2>
        <p className="text-sm text-muted-foreground">Add a new reusable follow-up draft.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Name</Label>
          <Input id="template-name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-channel">Channel</Label>
          <select 
            id="template-channel" 
            name="channel" 
            defaultValue="email"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-subject">Subject</Label>
          <Input id="template-subject" name="subject" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-body">Body</Label>
          <Textarea
            id="template-body"
            name="body"
            required
            defaultValue="Hi {{customer_name}}, checking in after {{service_name}}."
            className="h-24"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input name="isDefault" type="checkbox" id="template-is-default" className="w-4 h-4 rounded border-input" />
          <Label htmlFor="template-is-default">Set as default</Label>
        </div>
      </div>
      <Button type="submit" className="w-full">Create template</Button>
    </form>
  );
}
