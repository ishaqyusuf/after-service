import { BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import Link from "next/link";
import { pageTitle } from "../../lib/page-title";
import { featurePages, guidePages, solutionPages } from "../../lib/seo-content";

const linkClass =
  "inline-flex min-h-8 items-center text-muted-foreground hover:text-accent-foreground hover:underline";

const columns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      ...featurePages.map((page) => ({
        href: page.path,
        label: pageTitle(page.title),
      })),
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Solutions",
    links: solutionPages.map((page) => ({
      href: page.path,
      label: page.audience,
    })),
  },
  {
    title: "Guides",
    links: guidePages.map((page) => ({
      href: page.path,
      label: pageTitle(page.title),
    })),
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "mailto:hello@afterservice.app", label: "Contact" },
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-secondary pb-[calc(8rem+env(safe-area-inset-bottom))] pt-14 text-[15px] md:pb-7">
      <div className="wp-wrap">
        <div className="grid gap-8 sm:grid-cols-2 min-[961px]:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))]">
          <div className="grid content-start gap-3.5 sm:col-span-2 min-[961px]:col-span-1">
            <BrandLogo name={appMetadata.name} />
            <p className="max-w-[36ch] text-[14.5px] text-muted-foreground">
              Today your team contacts customers and records what happened.
              Connected SMS, WhatsApp delivery and automatic outreach are
              planned.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-2.5 text-[13px] font-bold">{column.title}</h2>
              <ul className="grid gap-0.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="wp-tertiary mt-10 border-t border-border pt-[18px] text-[13.5px]">
          © {new Date().getFullYear()} afterservice. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
