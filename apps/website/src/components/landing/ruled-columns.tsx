import { cn } from "@afterservice/ui";
import Link from "next/link";

type RuledItem = {
  body?: string;
  href?: string;
  title: string;
};

// Ruled columns under a 2px ink rule: the Wall planner list without cards.
export function RuledColumns({
  className,
  columns = 3,
  items,
  surface = "background",
}: {
  className?: string;
  columns?: 2 | 3;
  items: RuledItem[];
  surface?: "background" | "secondary";
}) {
  return (
    <ul
      className={cn(
        "grid gap-px border-t-2 border-foreground bg-border",
        columns === 2 && "sm:grid-cols-2 sm:[&>li:nth-child(odd)]:pl-0",
        columns === 3 && "md:grid-cols-3 md:[&>li:nth-child(3n+1)]:pl-0",
        className,
      )}
    >
      {items.map((item) => (
        <li
          className={cn(
            "grid content-start gap-2 py-5",
            surface === "secondary" ? "bg-secondary" : "bg-background",
            columns === 2 ? "sm:px-5" : "md:px-5",
          )}
          key={item.title}
        >
          <h3 className="text-[17px] font-semibold leading-snug">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-accent-foreground hover:underline"
              >
                {item.title}
              </Link>
            ) : (
              item.title
            )}
          </h3>
          {item.body ? (
            <p className="text-[15px] text-muted-foreground">{item.body}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
