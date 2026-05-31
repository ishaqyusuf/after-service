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
  Textarea,
} from "@afterservice/ui";
import { trpc } from "@/components/providers/trpc-provider";
import { useQueryState } from "nuqs";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useEffect } from "react";

const updateTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  channel: z.enum(["email", "sms", "phone", "whatsapp"]).default("email"),
  subject: z.string().trim().optional(),
  body: z.string().trim().min(1, "Body is required"),
  isDefault: z.boolean().default(false),
});

const archiveSchema = z.object({
  id: z.string().min(1),
});

export function TemplateSheet() {
  const [templateId, setTemplateId] = useQueryState("template_id");

  const { data: templateData, isLoading } = trpc.templates.get.useQuery(
    { id: templateId! },
    { enabled: !!templateId }
  );

  const utils = trpc.useUtils();

  const handleSuccess = () => {
    utils.templates.list.invalidate();
    utils.templates.get.invalidate({ id: templateId! });
    setTemplateId(null);
  };

  const updateMutation = trpc.templates.update.useMutation({ onSuccess: handleSuccess });
  const archiveMutation = trpc.templates.archive.useMutation({ onSuccess: handleSuccess });

  const form = useZodForm({
    schema: updateTemplateSchema,
    defaultValues: {
      id: "",
      name: "",
      channel: "email",
      subject: "",
      body: "",
      isDefault: false,
    }
  });

  const archiveForm = useZodForm({
    schema: archiveSchema,
    defaultValues: { id: "" }
  });

  useEffect(() => {
    if (templateData?.item && templateId) {
      const t = templateData.item;
      form.reset({
        id: templateId,
        name: t.name,
        channel: t.channel as "email" | "sms" | "phone" | "whatsapp",
        subject: t.subject ?? "",
        body: t.body,
        isDefault: t.isDefault,
      });
      archiveForm.reset({ id: templateId });
    }
  }, [templateData, templateId, form, archiveForm]);

  const handleOpenChange = (open: boolean) => {
    if (!open) setTemplateId(null);
  };

  return (
    <Sheet open={!!templateId} onOpenChange={handleOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Template</SheetTitle>
          <SheetDescription>Update this follow-up template.</SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="mt-6 flex justify-center py-8">Loading...</div>
        ) : (
          <div className="mt-6 space-y-6">
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <select 
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
                <Label>Subject</Label>
                <Input {...form.register("subject")} />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea 
                  className="h-32"
                  {...form.register("body")}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-is-default-edit"
                  className="w-4 h-4 rounded border-input"
                  {...form.register("isDefault")}
                />
                <Label htmlFor="template-is-default-edit">Set as default</Label>
              </div>
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>

            <form onSubmit={archiveForm.handleSubmit((data) => archiveMutation.mutate(data))} className="pt-4 border-t border-border">
              <Button type="submit" variant="destructive" className="w-full" disabled={archiveMutation.isPending}>
                {archiveMutation.isPending ? "Deleting..." : "Delete Template"}
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
