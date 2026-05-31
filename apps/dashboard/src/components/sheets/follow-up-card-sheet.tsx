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
  Badge,
} from "@afterservice/ui";
import {
  closeFollowUpAction,
  markFollowUpRepliedAction,
  markFollowUpSentAction,
  rescheduleFollowUpAction,
} from "@/lib/dashboard-actions";
import { formatDate } from "@/lib/dashboard-data";
import { useState } from "react";

export function FollowUpCardSheet({ item, recipient, body }: { item: any, recipient: string, body: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <strong className="text-sm">{item.customerName}</strong>
            <Badge variant={item.status === "sent" ? "default" : "secondary"}>
              {item.channel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{item.serviceTitle ?? "General check-in"}</p>
          <div className="text-xs text-muted-foreground">Due {formatDate(item.dueAt)}</div>
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Work Follow-up</SheetTitle>
          <SheetDescription>Update the state of this follow-up.</SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-8">
          <section>
            <h3 className="text-sm font-medium mb-3">Reschedule</h3>
            <form action={rescheduleFollowUpAction} className="space-y-3" onSubmit={() => setOpen(false)}>
              <input name="id" type="hidden" value={item.id} />
              <Input
                defaultValue={new Date(item.dueAt).toISOString().slice(0, 10)}
                name="dueAt"
                type="date"
              />
              <Button size="sm" type="submit" variant="secondary" className="w-full">
                Reschedule
              </Button>
            </form>
          </section>

          <section>
            <h3 className="text-sm font-medium mb-3">Log Manual Send</h3>
            <form action={markFollowUpSentAction} className="space-y-3" onSubmit={() => setOpen(false)}>
              <input name="id" type="hidden" value={item.id} />
              <Input name="recipient" defaultValue={recipient} />
              <Input name="subject" defaultValue="Checking in after your service" />
              <Textarea name="body" defaultValue={body} className="h-24" />
              <Button size="sm" type="submit" className="w-full">
                Log manual send
              </Button>
            </form>
          </section>

          <section>
            <h3 className="text-sm font-medium mb-3">Mark Replied</h3>
            <form action={markFollowUpRepliedAction} className="space-y-3" onSubmit={() => setOpen(false)}>
              <input name="id" type="hidden" value={item.id} />
              <Input name="notes" placeholder="Reply summary" />
              <Button size="sm" type="submit" variant="secondary" className="w-full">
                Mark replied
              </Button>
            </form>
          </section>

          <section className="pt-4 border-t border-border">
            <form action={closeFollowUpAction} onSubmit={() => setOpen(false)}>
              <input name="id" type="hidden" value={item.id} />
              <div className="flex gap-2">
                <Input name="notes" placeholder="Closure note" />
                <Button size="sm" type="submit" variant="destructive">
                  Close
                </Button>
              </div>
            </form>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
