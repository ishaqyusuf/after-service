"use client";

import { LogEvents } from "@afterservice/events";
import { useTrack } from "@afterservice/events/client";
import { BrandLogo } from "@afterservice/ui";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/#story", label: "How it works" },
  { href: "/#people", label: "Who it's for" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#questions", label: "Questions" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const track = useTrack();
  return (
    <header className="care-header">
      <div className="care-wrap care-header-inner">
        <Link
          href="/"
          aria-label="afterservice home"
          className="care-brand"
          onClick={() => setOpen(false)}
        >
          <BrandLogo name="afterservice" />
        </Link>
        <nav
          aria-label="Website navigation"
          className={open ? "care-nav is-open" : "care-nav"}
          id="care-navigation"
        >
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => {
              setOpen(false);
              track({
                event: LogEvents.CTA.name,
                channel: LogEvents.CTA.channel,
                location: "mobile_menu_signin",
              });
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="care-nav-mobile-cta"
            onClick={() => {
              setOpen(false);
              track({
                event: LogEvents.JoinFreeBeta.name,
                channel: LogEvents.JoinFreeBeta.channel,
                location: "mobile_menu_signup",
              });
            }}
          >
            Join the free beta <ArrowUpRight size={17} />
          </Link>
        </nav>
        <div className="care-header-actions">
          <Link
            href="/signup"
            className="care-header-cta"
            onClick={() =>
              track({
                event: LogEvents.JoinFreeBeta.name,
                channel: LogEvents.JoinFreeBeta.channel,
                location: "header_signup",
              })
            }
          >
            Join the free beta <ArrowUpRight size={17} />
          </Link>
          <button
            type="button"
            className="care-menu"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="care-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
