import { Badge, Button } from "@afterservice/ui";
import { CreateFollowUpForm } from "@/components/forms/create-follow-up-form";
import { FollowUpsTable } from "@/components/tables/follow-ups-table";
import { FollowUpsBoard } from "@/components/boards/follow-ups-board";
import Link from "next/link";
import { Suspense } from "react";

export default async function FollowUpsPage() {
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Badge variant="outline" className="mb-2">Core board</Badge>
          <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground max-w-2xl">
            Work every post-service check-in from due, upcoming, waiting,
            replied, and closed states.
          </p>
        </div>
        <Button asChild>
          <Link href="/templates">Manage templates</Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 items-start">
        <CreateFollowUpForm defaultDue={defaultDue.toISOString().slice(0, 10)} />

        <section className="space-y-8 min-w-0">
          <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading board...</div>}>
            <FollowUpsBoard />
          </Suspense>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Follow-up history</h2>
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading history...</div>}>
              <FollowUpsTable />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}

