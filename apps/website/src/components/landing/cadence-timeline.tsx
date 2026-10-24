import { cn } from "@afterservice/ui";

// A planner rhythm: dated moments on one rule, stacked on narrow screens.
export function CadenceTimeline({
  className,
  items,
}: {
  className?: string;
  items: Array<{ action: string; timing: string }>;
}) {
  return (
    <ol
      className={cn(
        "relative grid gap-6 sm:grid-cols-3 sm:pt-1.5 sm:before:absolute sm:before:inset-x-1.5 sm:before:top-[11px] sm:before:h-px sm:before:bg-input sm:before:content-['']",
        className,
      )}
    >
      {items.map((item) => (
        <li className="grid content-start gap-1.5" key={item.timing}>
          <span
            aria-hidden="true"
            className="relative size-3 rounded-full bg-primary shadow-[0_0_0_5px_hsl(var(--secondary))]"
          />
          <h3 className="text-lg font-semibold leading-snug">{item.timing}</h3>
          <p className="text-muted-foreground">{item.action}</p>
        </li>
      ))}
    </ol>
  );
}
