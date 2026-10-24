"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { BrandLogo, Button } from "@afterservice/ui";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StartFreeLink } from "./start-free-link";

const links = [
  { href: "/features", label: "Features" },
  { href: "/solutions/repair-shops", label: "Repair shops" },
  { href: "/pricing", label: "Pricing" },
  { href: "/guides/post-job-follow-up", label: "Guide" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const track = useTrack();

  const isCurrent = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 901px)");
    const closeOnWide = () => {
      if (wide.matches) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    menu.current?.querySelector<HTMLElement>("a")?.focus();
    wide.addEventListener("change", closeOnWide);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = overflow;
      wide.removeEventListener("change", closeOnWide);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const trackSignIn = (location: string) =>
    track({
      event: LogEvents.CTA.name,
      channel: LogEvents.CTA.channel,
      location,
    });

  return (
    <header className="wp-header sticky top-0 z-40 border-b border-border">
      <div className="wp-wrap flex h-[var(--wp-header-h)] items-center gap-7">
        <Link
          href="/"
          aria-label="afterservice home"
          className="inline-flex flex-none"
          onClick={() => setOpen(false)}
        >
          <BrandLogo name="afterservice" />
        </Link>

        <nav aria-label="Main" className="hidden min-[901px]:block">
          <ul className="flex gap-0.5">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className="inline-flex h-10 items-center rounded-lg px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-1.5 min-[901px]:flex">
          <Button
            asChild
            variant="ghost"
            className="h-11 rounded-[10px] px-[18px] text-[15px] font-semibold text-muted-foreground"
          >
            <Link href="/login" onClick={() => trackSignIn("header_signin")}>
              Sign in
            </Link>
          </Button>
          <StartFreeLink location="header_signup" />
        </div>

        <button
          ref={toggle}
          type="button"
          className="ml-auto grid size-11 place-items-center rounded-[10px] border border-input bg-card text-foreground min-[901px]:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="size-[18px]" aria-hidden="true" />
          ) : (
            <Menu className="size-[18px]" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        ref={menu}
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--wp-header-h))] overflow-y-auto border-b border-border bg-background px-5 pb-5 pt-2 shadow-[0_18px_40px_rgb(0_0_0/0.12)] min-[901px]:hidden"
      >
        <nav aria-label="Main menu">
          <ul className="grid">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[52px] items-center border-b border-border text-[17px] font-semibold text-foreground aria-[current=page]:text-accent-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-4 grid gap-2.5">
          <Button
            asChild
            variant="outline"
            className="h-11 w-full rounded-[10px] border-input bg-card text-[15px] font-semibold text-foreground"
          >
            <Link
              href="/login"
              onClick={() => {
                setOpen(false);
                trackSignIn("mobile_menu_signin");
              }}
            >
              Sign in
            </Link>
          </Button>
          <StartFreeLink
            location="mobile_menu_signup"
            className="w-full"
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
