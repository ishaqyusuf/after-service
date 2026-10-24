import { ChannelTag } from "@/components/follow-up-channel";
import type { DashboardOverviewData } from "./overview-types";
import { PlannerPanel } from "./planner-panel";

export function WeekFacts({
  className,
  data,
}: {
  className?: string;
  data: DashboardOverviewData;
}) {
  const facts = [
    ["Jobs completed, past 7 days", data.counts.completedThisWeek],
    ["Contacted, past 7 days", data.counts.sentThisWeek],
    ["Due in the next 7 days", data.counts.upcomingFollowUps],
    ["Overdue now", data.counts.overdueFollowUps],
  ] as const;
  const channels = data.followUpChannels.filter((item) => item.count > 0);
  const maxChannel = Math.max(1, ...channels.map((item) => item.count));

  return (
    <PlannerPanel title="This week" className={className}>
      <div className="grid gap-[18px]">
        <dl className="grid grid-cols-2 gap-3">
          {facts.map(([label, value]) => (
            <div key={label} className="py-1">
              <dt className="text-[12.5px] leading-snug text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-none tabular-nums">
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <div>
          <h3 className="mb-2 text-[13px] font-semibold">
            All follow-ups by channel
          </h3>
          {channels.length > 0 ? (
            <ul className="grid gap-2">
              {channels.map((item) => (
                <li
                  key={item.channel}
                  className="grid grid-cols-[96px_minmax(0,1fr)_32px] items-center gap-2.5"
                >
                  <ChannelTag channel={item.channel} />
                  <span
                    aria-hidden="true"
                    className="block h-2 min-w-0.5 rounded bg-[var(--wp-teal,#007d7a)] dark:bg-[var(--wp-teal,#33b5af)]"
                    style={{ width: `${(item.count / maxChannel) * 100}%` }}
                  />
                  <span className="text-right font-semibold tabular-nums">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13.5px] text-muted-foreground">
              No follow-ups planned yet.
            </p>
          )}
        </div>
      </div>
    </PlannerPanel>
  );
}
