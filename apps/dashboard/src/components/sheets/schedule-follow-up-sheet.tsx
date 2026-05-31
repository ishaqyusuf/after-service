"use client";

import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Textarea,
} from "@afterservice/ui";
import { createFollowUpFromJobAction } from "@/lib/dashboard-actions";
import { useState } from "react";

export function ScheduleFollowUpSheet({ job, templates, defaultDue }: { job: any, templates: any[], defaultDue: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">Schedule</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Schedule Follow-up</SheetTitle>
          <SheetDescription>Create a follow up action for {job.title}.</SheetDescription>
        </SheetHeader>
        
        <form action={createFollowUpFromJobAction} className="mt-6 space-y-4" onSubmit={() => setOpen(false)}>
          <input name="jobId" type="hidden" value={job.id} />
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              defaultValue={defaultDue}
              name="dueAt"
              type="date"
            />
          </div>
          <div className="space-y-2">
            <Label>Channel</Label>
            <select 
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
            <Label>Template</Label>
            <select 
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
            <Label>Notes</Label>
            <Textarea
              name="notes"
              defaultValue={`Follow up about ${job.title}.`}
            />
          </div>
          <Button type="submit" className="w-full mt-4">
            Create follow-up
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
