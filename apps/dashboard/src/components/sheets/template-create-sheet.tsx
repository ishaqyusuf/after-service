"use client";

import { createTemplateSchema } from "@afterservice/api/schemas";
import {
  Button,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useTemplateParams } from "@/hooks/use-template-params";
import { useZodForm } from "@/hooks/use-zod-form";

export function TemplateCreateSheet() {
  const { createTemplate, setParams } = useTemplateParams();

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
  const createTemplateMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      utils.templates.list.invalidate();
      form.reset();
      setParams({ createTemplate: null });
    },
  });

  return (
    <Sheet
      open={createTemplate ?? false}
      onOpenChange={(isOpen) => setParams({ createTemplate: isOpen ? true : null })}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create template</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <form
            onSubmit={form.handleSubmit((data) => createTemplateMutation.mutate(data))}
            className="space-y-6"
          >
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
            <Button
              type="submit"
              className="w-full"
              disabled={createTemplateMutation.isPending}
            >
              {createTemplateMutation.isPending ? "Creating..." : "Create template"}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
