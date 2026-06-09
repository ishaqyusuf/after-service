"use client";

import {
  Button,
  Input,
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { trpc } from "@/components/providers/trpc-provider";
import { useQueryState } from "nuqs";
import { useZodForm } from "@/hooks/use-zod-form";
import { z } from "zod";
import { useEffect } from "react";
import { resolveTemplate } from "@/lib/dashboard-format";
import { SheetFormSkeleton } from "./sheet-form-skeleton";

const rescheduleSchema = z.object({
  id: z.string().min(1),
  dueAt: z.coerce.date(),
});

const manualSendSchema = z.object({
  id: z.string().min(1),
  recipient: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
});

const markRepliedSchema = z.object({
  id: z.string().min(1),
  notes: z.string().optional(),
});

const closeSchema = z.object({
  id: z.string().min(1),
  notes: z.string().optional(),
});

export function FollowUpCardSheet() {
  const [followUpId, setFollowUpId] = useQueryState("follow_up_id");

  const { data: followUpData, isLoading } = trpc.followUps.get.useQuery(
    { id: followUpId! },
    { enabled: !!followUpId }
  );

  const utils = trpc.useUtils();

  const handleSuccess = () => {
    utils.followUps.listBoard.invalidate();
    utils.followUps.listTable.invalidate();
    utils.followUps.get.invalidate({ id: followUpId! });
    setFollowUpId(null);
  };

  const rescheduleMutation = trpc.followUps.reschedule.useMutation({ onSuccess: handleSuccess });
  const markSentMutation = trpc.followUps.markSent.useMutation({ onSuccess: handleSuccess });
  const markRepliedMutation = trpc.followUps.markReplied.useMutation({ onSuccess: handleSuccess });
  const closeMutation = trpc.followUps.close.useMutation({ onSuccess: handleSuccess });

  const rescheduleForm = useZodForm({ schema: rescheduleSchema, defaultValues: { id: "", dueAt: new Date() } });
  const sendForm = useZodForm({ schema: manualSendSchema, defaultValues: { id: "", recipient: "", subject: "Checking in after your service", body: "" } });
  const repliedForm = useZodForm({ schema: markRepliedSchema, defaultValues: { id: "", notes: "" } });
  const closeForm = useZodForm({ schema: closeSchema, defaultValues: { id: "", notes: "" } });

  useEffect(() => {
    if (followUpData?.item && followUpId) {
      const item = followUpData.item;
      const recipient = item.channel === "email" ? "customer@example.com" : "manual";
      const body = resolveTemplate(
        item.notes ?? "Checking in after your service.",
        {
          businessName: "afterservice",
          customerName: item.customerName,
          serviceName: item.serviceTitle,
        },
      );

      rescheduleForm.reset({ id: followUpId, dueAt: new Date(item.dueAt) });
      sendForm.reset({ id: followUpId, recipient, subject: "Checking in after your service", body });
      repliedForm.reset({ id: followUpId, notes: "" });
      closeForm.reset({ id: followUpId, notes: "" });
    }
  }, [followUpData, followUpId, rescheduleForm, sendForm, repliedForm, closeForm]);

  const handleOpenChange = (open: boolean) => {
    if (!open) setFollowUpId(null);
  };

  return (
    <Sheet open={!!followUpId} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Work Follow-up</SheetTitle>
          <SheetDescription>Update the state of this follow-up.</SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <SheetFormSkeleton fields={6} />
        ) : (
          <div className="mt-6 space-y-8">
            <section>
              <h3 className="text-sm font-medium mb-3">Reschedule</h3>
              <Form {...rescheduleForm}>
                <form
                  onSubmit={rescheduleForm.handleSubmit((data) =>
                    rescheduleMutation.mutate(data),
                  )}
                  className="space-y-3"
                >
                  <FormField
                    control={rescheduleForm.control}
                    name="dueAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={toDateInputValue(field.value)}
                            onChange={(event) =>
                              field.onChange(
                                event.target.value
                                  ? new Date(`${event.target.value}T00:00:00`)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    disabled={rescheduleMutation.isPending}
                  >
                    {rescheduleMutation.isPending
                      ? "Rescheduling..."
                      : "Reschedule"}
                  </Button>
                </form>
              </Form>
            </section>

            <section>
              <h3 className="text-sm font-medium mb-3">Log Manual Send</h3>
              <Form {...sendForm}>
                <form
                  onSubmit={sendForm.handleSubmit((data) =>
                    markSentMutation.mutate(data),
                  )}
                  className="space-y-3"
                >
                  <FormField
                    control={sendForm.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={sendForm.control}
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
                    control={sendForm.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body</FormLabel>
                        <FormControl>
                          <Textarea className="h-24" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    className="w-full"
                    disabled={markSentMutation.isPending}
                  >
                    {markSentMutation.isPending
                      ? "Logging..."
                      : "Log manual send"}
                  </Button>
                </form>
              </Form>
            </section>

            <section>
              <h3 className="text-sm font-medium mb-3">Mark Replied</h3>
              <Form {...repliedForm}>
                <form
                  onSubmit={repliedForm.handleSubmit((data) =>
                    markRepliedMutation.mutate(data),
                  )}
                  className="space-y-3"
                >
                  <FormField
                    control={repliedForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reply summary</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    variant="secondary"
                    className="w-full"
                    disabled={markRepliedMutation.isPending}
                  >
                    {markRepliedMutation.isPending
                      ? "Marking..."
                      : "Mark replied"}
                  </Button>
                </form>
              </Form>
            </section>

            <section className="pt-4 border-t border-border">
              <Form {...closeForm}>
                <form
                  onSubmit={closeForm.handleSubmit((data) =>
                    closeMutation.mutate(data),
                  )}
                  className="flex items-end gap-2"
                >
                  <FormField
                    control={closeForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Closure note</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    size="sm"
                    type="submit"
                    variant="destructive"
                    disabled={closeMutation.isPending}
                  >
                    {closeMutation.isPending ? "Closing..." : "Close"}
                  </Button>
                </form>
              </Form>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}
