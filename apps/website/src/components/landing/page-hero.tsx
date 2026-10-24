import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href: string; label: string };

export function PageHero({
  body,
  children,
  crumbs,
  title,
}: {
  body?: ReactNode;
  children?: ReactNode;
  crumbs?: Crumb[];
  title: string;
}) {
  return (
    <section
      aria-labelledby="page-title"
      className="border-b border-border bg-secondary pb-[clamp(32px,4vw,56px)] pt-[clamp(48px,7vw,96px)]"
    >
      <div className="wp-wrap grid justify-items-start gap-5">
        {crumbs ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              {crumbs.map((crumb) => (
                <li className="flex items-center gap-2" key={crumb.href}>
                  <Link
                    href={crumb.href}
                    className="inline-flex min-h-8 items-center hover:text-accent-foreground hover:underline"
                  >
                    {crumb.label}
                  </Link>
                  <span aria-hidden="true" className="wp-tertiary">
                    /
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1
          id="page-title"
          className="wp-display max-w-[20ch] text-[clamp(36px,5vw,60px)] leading-[1.04] tracking-[-0.02em]"
        >
          {title}
        </h1>
        {body ? (
          <p className="max-w-[58ch] text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">
            {body}
          </p>
        ) : null}
        {children}
      </div>
    </section>
  );
}
