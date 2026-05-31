import { Badge, Button } from "@afterservice/ui";
import { getFollowUpsData, resolveTemplate } from "@/lib/dashboard-data";
import { CreateFollowUpForm } from "@/components/forms/create-follow-up-form";
import { FollowUpsTable } from "@/components/tables/follow-ups-table";
import { FollowUpCardSheet } from "@/components/sheets/follow-up-card-sheet";
import Link from "next/link";

type BoardItem = Awaited<
  ReturnType<typeof getFollowUpsData>
>["followUps"][number];

export default async function FollowUpsPage() {
  const { columns, customers, jobs, templates, workspace } =
    await getFollowUpsData();
  const defaultDue = new Date(
    Date.now() + workspace.defaultFollowUpDelayDays * 86400000,
  )
    .toISOString()
    .slice(0, 10);

  const allFollowUps = [
    ...columns.dueToday,
    ...columns.upcoming,
    ...columns.waiting,
    ...columns.replied,
    ...columns.closed,
  ];

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
        <CreateFollowUpForm 
          customers={customers} 
          jobs={jobs} 
          templates={templates} 
          defaultDue={defaultDue} 
        />

        <section className="space-y-8 min-w-0">
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            <BoardColumn title="Due today" items={columns.dueToday} />
            <BoardColumn title="Upcoming" items={columns.upcoming} />
            <BoardColumn title="Waiting" items={columns.waiting} />
            <BoardColumn title="Replied" items={columns.replied} />
            <BoardColumn title="Closed" items={columns.closed} />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Follow-up history</h2>
            <FollowUpsTable items={allFollowUps} />
          </div>
        </section>
      </div>
    </div>
  );
}

function BoardColumn({ items, title }: { items: BoardItem[]; title: string }) {
  return (
    <div className="flex flex-col w-[300px] shrink-0 snap-start bg-muted/50 rounded-lg p-3">
      <h2 className="text-sm font-semibold mb-3 flex items-center justify-between px-1">
        {title} 
        <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-xs">
          {items.length}
        </span>
      </h2>
      <div className="space-y-3 flex-1 overflow-y-auto min-h-[100px]">
        {items.map((item) => (
          <FollowUpCard item={item} key={item.id} />
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No cards.</p>
        ) : null}
      </div>
    </div>
  );
}

function FollowUpCard({ item }: { item: BoardItem }) {
  const recipient = item.channel === "email" ? "customer@example.com" : "manual";
  const body = resolveTemplate(
    item.notes ?? "Checking in after your service.",
    {
      businessName: "afterservice",
      customerName: item.customerName,
      serviceName: item.serviceTitle,
    },
  );

  return <FollowUpCardSheet item={item} recipient={recipient} body={body} />;
}

