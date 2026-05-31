"use client";

import { Button, Input, Label, Textarea } from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";

const createTemplateSchema = z.object({
  body: z.string().trim().min(1, "Body is required"),
  channel: z.enum(["email", "sms", "phone", "whatsapp"]).default("email"),
  isDefault: z.boolean().default(false),
  name: z.string().trim().min(1, "Name is required"),
  subject: z.string().trim().optional(),
});

export function CreateTemplateForm() {
  const form = useZodForm({
    schema: createTemplateSchema,
    defaultValues: {
      name: "",
      channel: "email",
      subject: "",
      body: "Hi {{customer_name}}, checking in after {{service_name}}.",
      isDefault: false,
    }
  });

  const utils = trpc.useUtils();
  const createTemplate = trpc.templates.create.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      form.reset();
    },
  });

  return (
    <form onSubmit={form.handleSubmit((data) => createTemplate.mutate(data))} className="space-y-6 bg-card p-6 rounded-xl border border-border shadow-sm w-full max-w-md">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Create template</h2>
        <p className="text-sm text-muted-foreground">Add a new reusable follow-up draft.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name">Name</Label>
          <Input id="template-name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-channel">Channel</Label>
          <select 
            id="template-channel" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...form.register("channel")}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-subject">Subject</Label>
          <Input id="template-subject" {...form.register("subject")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="template-body">Body</Label>
          <Textarea
            id="template-body"
            className="h-24"
            {...form.register("body")}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="template-is-default" className="w-4 h-4 rounded border-input" {...form.register("isDefault")} />
          <Label htmlFor="template-is-default">Set as default</Label>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={createTemplate.isPending}>
        {createTemplate.isPending ? "Creating..." : "Create template"}
      </Button>
    </form>
  );
}
