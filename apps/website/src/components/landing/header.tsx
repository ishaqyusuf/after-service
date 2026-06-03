/* biome-ignore-all lint/a11y/noSvgWithoutTitle: Inline icons are decorative and paired with visible text. */
/* biome-ignore-all lint/a11y/useValidAnchor: Hash links navigate to page sections and close the mobile menu. */

"use client";

import { BrandLogo, Button } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import { useEffect, useState } from "react";
import { useTrack } from "@afterservice/events/client";
import { LogEvents } from "@afterservice/events";

export function LandingHeader() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const track = useTrack();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">
        <a href="/" className="inline-flex items-center">
          <BrandLogo name={appMetadata.name} />
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a
            href="#features"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faqs"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            FAQs
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-card border border-border hover:border-[#009b98]/40 transition-all duration-200 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <a
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-[#18211c] dark:hover:text-white transition-colors"
            onClick={() => track({ event: LogEvents.CTA.name, channel: LogEvents.CTA.channel, location: "header_signin" })}
          >
            Sign In
          </a>
          <a 
            href="/signup"
            onClick={() => track({ event: LogEvents.CTA.name, channel: LogEvents.CTA.channel, location: "header_signup" })}
          >
            <Button size="sm">Start Free Trial</Button>
          </a>
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-card border border-border hover:border-[#009b98]/40 transition-all duration-200 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg
                className="w-5 h-5 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-card border border-border hover:border-[#009b98]/40 transition-all duration-200 shadow-sm"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-5 h-5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-[#18211c] dark:hover:text-white hover:bg-[#e9eee6] dark:hover:bg-[#111814] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-[#18211c] dark:hover:text-white hover:bg-[#e9eee6] dark:hover:bg-[#111814] transition-colors"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-[#18211c] dark:hover:text-white hover:bg-[#e9eee6] dark:hover:bg-[#111814] transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-[#18211c] dark:hover:text-white hover:bg-[#e9eee6] dark:hover:bg-[#111814] transition-colors"
            >
              FAQs
            </a>
            <div className="border-t border-border mt-2 pt-4 flex flex-col gap-3 px-4">
              <a
                href="/login"
                onClick={() => {
                  setMobileMenuOpen(false);
                  track({ event: LogEvents.CTA.name, channel: LogEvents.CTA.channel, location: "mobile_menu_signin" });
                }}
                className="text-sm font-medium text-muted-foreground hover:text-[#18211c] dark:hover:text-white transition-colors"
              >
                Sign In
              </a>
              <a 
                href="/signup" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  track({ event: LogEvents.CTA.name, channel: LogEvents.CTA.channel, location: "mobile_menu_signup" });
                }}
              >
                <Button size="sm" className="w-full">
                  Start Free Trial
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
