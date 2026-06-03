"use client";

import { trpc } from "@/components/providers/trpc-provider";
import Link from "next/link";
import { resolveTemplate } from "@/lib/dashboard-format";

type BoardItem = any; // Type comes from tRPC router ideally

export function FollowUpsBoard() {
  const [{ columns }] = trpc.followUps.listBoard.useSuspenseQuery();

  if (!columns) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      <BoardColumn title="Due today" items={columns.dueToday} />
      <BoardColumn title="Upcoming" items={columns.upcoming} />
      <BoardColumn title="Waiting" items={columns.waiting} />
      <BoardColumn title="Replied" items={columns.replied} />
      <BoardColumn title="Closed" items={columns.closed} />
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

  return (
    <Link 
      href={`?follow_up_id=${item.id}`} 
      scroll={false}
      className="block bg-card rounded-md border border-border p-3 shadow-sm hover:border-primary/50 transition-colors text-left"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-sm font-medium truncate">{item.customerName}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{item.channel}</span>
      </div>
      <div className="text-xs text-muted-foreground mb-2 truncate">
        {item.serviceTitle}
      </div>
      <p className="text-sm line-clamp-2 text-foreground/80">
        {body}
      </p>
    </Link>
  );
}
