import { cn } from "@afterservice/ui";

// Ruled planner columns for real sequences. Numbers carry the order.
export function NumberedSteps({
  className,
  steps,
}: {
  className?: string;
  steps: string[];
}) {
  return (
    <ol
      className={cn(
        "grid overflow-hidden rounded-[14px] border border-border bg-card md:grid-cols-2",
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          className="flex gap-4 border-b border-border px-5 py-5 last:border-b-0 md:[&:nth-child(odd)]:border-r md:[&:nth-last-child(-n+2):nth-child(odd)]:border-b-0"
          key={step}
        >
          <span
            aria-hidden="true"
            className="wp-display w-6 flex-none text-[28px] leading-none text-accent-foreground [font-variant-numeric:tabular-nums]"
          >
            {index + 1}
          </span>
          <p className="text-[15.5px] text-foreground">{step}</p>
        </li>
      ))}
    </ol>
  );
}
