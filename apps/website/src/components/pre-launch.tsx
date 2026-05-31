/* biome-ignore-all lint/a11y/noSvgWithoutTitle: Inline icons are decorative and paired with visible text. */

"use client";

import { Badge, BrandLogo, Button, Input } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";
import { useState } from "react";
import Link from "next/link";

export function PreLaunchPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email?.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call to register waitlist
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col justify-between py-12 px-6 sm:px-12 transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary opacity-[0.04] dark:opacity-[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary opacity-[0.02] dark:opacity-[0.05] blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="inline-flex items-center">
          <BrandLogo name={appMetadata.name} />
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="bg-success text-success-foreground">PRE-LAUNCH</Badge>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto w-full text-center flex-1 flex flex-col justify-center my-16">
        {/* Glow pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mx-auto mb-8 hover:border-primary/40 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Private Beta Launching Summer 2026</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.05]">
          The After-Service Engine <br className="hidden sm:inline" />
          for Local Operators
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop losing clients after the job is done. afterservice automates
          customer check-ins, drives 5-star reviews, and triggers repeat
          bookings while you focus on your trade.
        </p>

        {/* Waitlist Box */}
        <div className="max-w-md mx-auto w-full mb-16">
          {submitted ? (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 backdrop-blur-md shadow-2xl animate-fade-in transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 text-primary">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                You're on the list!
              </h3>
              <p className="text-sm text-muted-foreground">
                Thank you for joining. We will notify you as soon as our private
                beta opens.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 bg-card p-2 border border-border rounded-2xl shadow-2xl backdrop-blur-md transition-colors duration-300"
            >
              <Input
                type="email"
                placeholder="Enter your work email..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="flex-1 border-0 focus-visible:ring-0 shadow-none text-base bg-transparent px-4"
              />
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="rounded-xl w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Joining...</span>
                  </>
                ) : (
                  <span>Request Invite</span>
                )}
              </Button>
            </form>
          )}
          {error && (
            <p className="text-destructive text-sm mt-3 text-left pl-3">
              {error}
            </p>
          )}
        </div>

        {/* Feature Teaser Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-card border border-border hover:border-primary/40 p-6 rounded-2xl shadow-sm transition-all duration-300 backdrop-blur-sm group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Smart Check-Ins
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Autosend follow-up text or email requests after service job
              completions to gauge satisfaction before reviews are posted.
            </p>
          </div>

          <div className="bg-card border border-border hover:border-primary/40 p-6 rounded-2xl shadow-sm transition-all duration-300 backdrop-blur-sm group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.88a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.88a1 1 0 00-1.176 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.88c-.773-.568-.375-1.81.587-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              5-Star Reviews
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Target happy customers to review your business directly on Google,
              Local Services Ads, and Yelp to boost your SEO.
            </p>
          </div>

          <div className="bg-card border border-border hover:border-primary/40 p-6 rounded-2xl shadow-sm transition-all duration-300 backdrop-blur-sm group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.21" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-foreground">
              Repeat Bookings
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Schedule seasonal check-ins, service intervals, or warranty
              extensions dynamically based on customer service history.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-xs text-muted-foreground mt-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo name={appMetadata.name} />
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-foreground transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors duration-200">
            Terms of Service
          </Link>
          <Link href="mailto:hello@afterservice.app" className="hover:text-foreground transition-colors duration-200">
            Contact Us
          </Link>
        </div>
      </footer>
    </div>
  );
}
