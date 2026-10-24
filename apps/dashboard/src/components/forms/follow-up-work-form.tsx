"use client";

import {
  Button,
  Calendar,
  Icons,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@afterservice/ui";
import { cn } from "@afterservice/ui/cn";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@afterservice/ui/form";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, Check, Reply, Send } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  type FollowUp,
  useFollowUpFormContext,
} from "@/components/follow-up/form-context";
import { followUpChannelLabel } from "@/components/follow-up-channel";
import { toFollowUpStage } from "@/components/follow-up-stage";
import { QuickFill } from "@/components/quick-fill";
import { useDashboardInvalidations } from "@/hooks/use-dashboard-invalidations";
import { useFollowUpParams } from "@/hooks/use-follow-up-params";
import { useTimeZone } from "@/hooks/use-time-zone";
import { useTRPC } from "@/trpc/client";
import { calendarDay } from "@/utils/follow-up-dates";

type Props = {
  followUp: FollowUp;
};

type WorkAction = "contact" | "reply" | "reschedule" | "close";

const submitClassName = "h-11 w-full gap-2 md:h-9";

function defaultAction(followUp: FollowUp, timeZone: string): WorkAction {
  const today = calendarDay(new Date(), timeZone);
  const stage = toFollowUpStage(
    followUp.status,
    calendarDay(followUp.dueAt, timeZone),
    today,
  );
  if (stage === "waiting") return "reply";
  if (stage === "replied") return "close";
  if (stage === "closed") return "reschedule";
  return "contact";
}

export function FollowUpWorkForm({ followUp }: Props) {
  const trpc = useTRPC();
  const timeZone = useTimeZone();
  const { setParams } = useFollowUpParams();
  const invalidate = useDashboardInvalidations();
  const { forms } = useFollowUpFormContext();
  const {
    close: closeForm,
    replied: repliedForm,
    reschedule: rescheduleForm,
    send: sendForm,
  } = forms;
  const [action, setAction] = useState<WorkAction>(() =>
    defaultAction(followUp, timeZone),
  );
  const isPhone = followUp.channel === "phone";

  const handleSuccess = () => {
    invalidate.followUps(followUp.id);
    setParams(null);
  };

  const rescheduleMutation = useMutation(
    trpc.followUps.reschedule.mutationOptions({
      onError: (error) => {
        rescheduleForm.setError("dueAt", {
          type: "manual",
          message: error.message,
        });
      },
      onSuccess: handleSuccess,
    }),
  );
  const markSentMutation = useMutation(
    trpc.followUps.markSent.mutationOptions({
      onError: (error) => {
        sendForm.setError("recipient", {
          type: "manual",
          message: error.message,
        });
      },
      onSuccess: handleSuccess,
    }),
  );
  const markRepliedMutation = useMutation(
    trpc.followUps.markReplied.mutationOptions({
      onError: (error) => {
        repliedForm.setError("notes", {
          type: "manual",
          message: error.message,
        });
      },
      onSuccess: handleSuccess,
    }),
  );
  const closeMutation = useMutation(
    trpc.followUps.close.mutationOptions({
      onError: (error) => {
        closeForm.setError("notes", { type: "manual", message: error.message });
      },
      onSuccess: handleSuccess,
    }),
  );

  return (
    <section
      aria-label="Record what happened"
      className="rounded-[14px] border border-border p-3"
    >
      {followUp.status === "closed" ? (
        <p className="mb-3 rounded-[10px] border-[1.5px] border-dashed border-border px-3 py-2.5 text-[13px] text-muted-foreground">
          This follow-up is closed. Reschedule it, or plan another if the
          customer needs one.
        </p>
      ) : null}
      <Tabs
        value={action}
        onValueChange={(value) => setAction(value as WorkAction)}
      >
        <TabsList
          aria-label="What happened?"
          className="mb-3.5 grid h-auto w-full grid-cols-2 gap-1 rounded-xl bg-background p-1 sm:flex sm:flex-wrap"
        >
          <WorkTab value="contact" icon={<Send className="size-[15px]" />}>
            {isPhone ? "Log call" : "Contact"}
          </WorkTab>
          <WorkTab value="reply" icon={<Reply className="size-[15px]" />}>
            Log reply
          </WorkTab>
          <WorkTab
            value="reschedule"
            icon={<CalendarClock className="size-[15px]" />}
          >
            Reschedule
          </WorkTab>
          <WorkTab value="close" icon={<Check className="size-[15px]" />}>
            Close
          </WorkTab>
        </TabsList>

        <TabsContent value="contact" className="mt-0">
          <WorkHint>
            {isPhone
              ? "Call the customer yourself, then record the call here."
              : `Submitting sends this message by ${followUpChannelLabel(followUp.channel)} to the recipient below.`}
          </WorkHint>
          <Form {...sendForm}>
            <form
              onSubmit={sendForm.handleSubmit((data) =>
                markSentMutation.mutate(data),
              )}
              className="space-y-3"
            >
              <div className="flex justify-end">
                <QuickFill name="messageDraft" />
              </div>
              <FormField
                control={sendForm.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem className={isPhone ? "hidden" : undefined}>
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
                  <FormItem className={isPhone ? "hidden" : undefined}>
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
                    <FormLabel>{isPhone ? "Call notes" : "Message"}</FormLabel>
                    <FormControl>
                      <Textarea className="h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className={submitClassName}
                disabled={markSentMutation.isPending}
              >
                <Send aria-hidden="true" className="size-4" />
                {markSentMutation.isPending
                  ? isPhone
                    ? "Logging..."
                    : "Sending..."
                  : isPhone
                    ? "Log call"
                    : "Send message"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="reply" className="mt-0">
          <WorkHint>Use the customer's words where it matters.</WorkHint>
          <Form {...repliedForm}>
            <form
              onSubmit={repliedForm.handleSubmit((data) =>
                markRepliedMutation.mutate(data),
              )}
              className="space-y-3"
            >
              <div className="flex justify-end">
                <QuickFill name="workNote" />
              </div>
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
                type="submit"
                className={submitClassName}
                disabled={markRepliedMutation.isPending}
              >
                <Reply aria-hidden="true" className="size-4" />
                {markRepliedMutation.isPending ? "Saving..." : "Log reply"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="reschedule" className="mt-0">
          <Form {...rescheduleForm}>
            <form
              onSubmit={rescheduleForm.handleSubmit((data) =>
                rescheduleMutation.mutate(data),
              )}
              className="space-y-3"
            >
              <div className="flex justify-end">
                <QuickFill name="scheduleFollowUp" />
              </div>
              <FormField
                control={rescheduleForm.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>New due date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 justify-start text-left font-normal md:h-9",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value instanceof Date
                              ? format(field.value, "PPP")
                              : "Pick a date"}
                            <Icons.CalendarMonth className="ml-auto size-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value instanceof Date
                              ? field.value
                              : undefined
                          }
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="secondary"
                className={submitClassName}
                disabled={rescheduleMutation.isPending}
              >
                <CalendarClock aria-hidden="true" className="size-4" />
                {rescheduleMutation.isPending
                  ? "Rescheduling..."
                  : "Reschedule"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="close" className="mt-0">
          <WorkHint>
            Leave a closing note so the next person knows how it ended.
          </WorkHint>
          <Form {...closeForm}>
            <form
              onSubmit={closeForm.handleSubmit((data) =>
                closeMutation.mutate(data),
              )}
              className="space-y-3"
            >
              <FormField
                control={closeForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Closure note</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="destructive"
                className={submitClassName}
                disabled={closeMutation.isPending}
              >
                <Check aria-hidden="true" className="size-4" />
                {closeMutation.isPending ? "Closing..." : "Close follow-up"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function WorkTab({
  children,
  icon,
  value,
}: {
  children: string;
  icon: ReactNode;
  value: WorkAction;
}) {
  return (
    <TabsTrigger
      value={value}
      className="min-h-10 flex-[1_1_auto] gap-1.5 rounded-[9px] px-3 text-[13px] font-semibold text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-[0_1px_2px_rgb(0_0_0/0.1),0_0_0_1px_hsl(var(--border))] md:min-h-9"
    >
      <span aria-hidden="true">{icon}</span>
      {children}
    </TabsTrigger>
  );
}

function WorkHint({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 rounded-[10px] bg-[var(--wp-teal-soft,#e1f1ef)] px-3 py-2 text-[13px] text-foreground dark:bg-[var(--wp-teal-soft,#11302d)]">
      {children}
    </p>
  );
}
