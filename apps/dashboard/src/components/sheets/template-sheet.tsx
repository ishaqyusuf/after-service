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
import {
  archiveTemplateAction,
  updateTemplateAction,
} from "@/lib/dashboard-actions";
import { useState } from "react";

export function TemplateSheet({ template }: { template: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Template</SheetTitle>
          <SheetDescription>Update this follow-up template.</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          <form action={updateTemplateAction} className="space-y-4" onSubmit={() => setOpen(false)}>
            <input name="id" type="hidden" value={template.id} />
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" defaultValue={template.name} />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <select 
                name="channel" 
                defaultValue={template.channel}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                name="subject"
                defaultValue={template.subject ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea 
                name="body" 
                defaultValue={template.body} 
                className="h-32"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                defaultChecked={template.isDefault}
                name="isDefault"
                type="checkbox"
                id="template-is-default-edit"
                className="w-4 h-4 rounded border-input"
              />
              <Label htmlFor="template-is-default-edit">Set as default</Label>
            </div>
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>

          <form action={archiveTemplateAction} className="pt-4 border-t border-border" onSubmit={() => setOpen(false)}>
            <input name="id" type="hidden" value={template.id} />
            <Button type="submit" variant="destructive" className="w-full">
              Delete Template
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
