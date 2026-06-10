"use client";

import { createTemplateSchema } from "@afterservice/api/schemas";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { trpc } from "@/components/providers/trpc-provider";
import {
  templateChannelLabels,
  templateChannels,
} from "@/hooks/use-template-filter-params";
import { useTemplateParams } from "@/hooks/use-template-params";
import { useZodForm } from "@/hooks/use-zod-form";

const channelOptions = templateChannels.map((channel) => ({
  label: templateChannelLabels[channel],
  value: channel,
}));

export function TemplateCreateForm() {
  const { setParams } = useTemplateParams();

  const form = useZodForm({
    schema: createTemplateSchema,
    defaultValues: {
      name: "",
      channel: "email",
      subject: "",
      body: "Hi {{customer_name}}, checking in after {{service_name}}.",
      isDefault: false,
    },
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          createTemplateMutation.mutate(data),
        )}
        className="space-y-6"
      >
        <div className="space-y-4">
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                  <Textarea className="h-24" {...field} />
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
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={createTemplateMutation.isPending}
        >
          {createTemplateMutation.isPending
            ? "Creating..."
            : "Create template"}
        </Button>
      </form>
    </Form>
  );
}
