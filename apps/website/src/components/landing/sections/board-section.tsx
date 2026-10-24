import { cn } from "@afterservice/ui";
import { Info } from "lucide-react";
import { boardRule, boardStages } from "../landing-content";
import { SectionHeading, SectionLede } from "../section-heading";
import { StageMark } from "../stage-mark";

export function BoardSection() {
  return (
    <section
      id="board"
      aria-labelledby="board-title"
      className="py-[clamp(56px,8vw,104px)]"
    >
      <div className="wp-wrap">
        <SectionHeading id="board-title">
          One board that answers “who needs a call today?”
        </SectionHeading>
        <SectionLede>
          Every follow-up sits in one of five stages. They move when your team
          does something, so the board always matches what actually happened.
        </SectionLede>
        <ol className="mt-9 grid overflow-hidden rounded-[14px] border border-input bg-card min-[1041px]:grid-cols-5">
          {boardStages.map((stage) => (
            <li
              className={cn(
                "grid min-w-0 items-start gap-2.5 border-b border-border px-3.5 pb-3.5 pt-4 last:border-b-0",
                "min-[561px]:grid-cols-[150px_minmax(0,1fr)]",
                "min-[1041px]:grid-cols-1 min-[1041px]:grid-rows-[auto_1fr_auto] min-[1041px]:border-b-0 min-[1041px]:border-r min-[1041px]:last:border-r-0",
                stage.key === "due" && "wp-due-tint",
              )}
              key={stage.key}
            >
              <div className="min-[561px]:row-span-2 min-[1041px]:row-span-1 min-[1041px]:border-b min-[1041px]:border-border min-[1041px]:pb-2.5">
                <StageMark stage={stage.key} className="text-[15px]" />
              </div>
              <p className="text-[14.5px] text-muted-foreground">
                {stage.text}
              </p>
              <p
                className={cn(
                  "grid gap-0.5 rounded-[10px] border border-border px-[11px] py-2.5 text-[13.5px]",
                  stage.key === "closed"
                    ? "border-dashed bg-transparent"
                    : "bg-secondary",
                )}
              >
                <span className="font-semibold text-foreground">
                  {stage.who}
                </span>
                <span className="text-muted-foreground">{stage.what}</span>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-6 flex max-w-[72ch] items-start gap-2.5 text-[15px] text-muted-foreground">
          <Info
            className="mt-[3px] size-[18px] flex-none text-accent-foreground"
            aria-hidden="true"
          />
          <span>{boardRule}</span>
        </p>
        <p className="wp-tertiary mt-2 text-[13px]">Names are illustrative.</p>
      </div>
    </section>
  );
}
