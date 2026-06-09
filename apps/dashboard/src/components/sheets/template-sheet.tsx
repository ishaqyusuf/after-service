"use client";

import { updateTemplateSchema } from "@afterservice/api/schemas";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@afterservice/ui";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { z } from "zod";
import { trpc } from "@/components/providers/trpc-provider";
import { useZodForm } from "@/hooks/use-zod-form";
import { SheetFormSkeleton } from "./sheet-form-skeleton";

const channelOptions = [
  { label: "Email", value: "email" },
  { label: "SMS", value: "sms" },
  { label: "Phone", value: "phone" },
  { label: "WhatsApp", value: "whatsapp" },
] as const;

const archiveSchema = z.object({
  id: z.string().min(1),
});

export function TemplateSheet() {
  const [templateId, setTemplateId] = useQueryState("template_id");

  const { data: templateData, isLoading } = trpc.templates.get.useQuery(
    { id: templateId! },
    { enabled: !!templateId },
  );

  const utils = trpc.useUtils();

  const handleSuccess = () => {
    utils.templates.list.invalidate();
    utils.templates.get.invalidate({ id: templateId! });
    setTemplateId(null);
  };

  const updateMutation = trpc.templates.update.useMutation({
    onSuccess: handleSuccess,
  });
  const archiveMutation = trpc.templates.archive.useMutation({
    onSuccess: handleSuccess,
  });

  const form = useZodForm({
    schema: updateTemplateSchema,
    defaultValues: {
      id: "",
      name: "",
      channel: "email",
      subject: "",
      body: "",
      isDefault: false,
    },
  });

  const archiveForm = useZodForm({
    schema: archiveSchema,
    defaultValues: { id: "" },
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
          <SheetTitle>Edit template</SheetTitle>
          <SheetDescription>Update this follow-up template.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <SheetFormSkeleton fields={5} />
        ) : (
          <div className="mt-6 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  updateMutation.mutate(data),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {channelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <Textarea className="h-32" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use variables like {"{{customer_name}}"} and{" "}
                        {"{{service_name}}"}.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Set as default</FormLabel>
                        <FormDescription>
                          Use this template first for its channel.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </Form>

            <form
              onSubmit={archiveForm.handleSubmit((data) =>
                archiveMutation.mutate(data),
              )}
              className="pt-4 border-t border-border"
            >
              <Button
                type="submit"
                variant="destructive"
                className="w-full"
                disabled={archiveMutation.isPending}
              >
                {archiveMutation.isPending ? "Deleting..." : "Delete Template"}
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
