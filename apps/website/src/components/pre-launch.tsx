"use client";

import { useState, useEffect } from "react";

export function PreLaunchPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Load and apply initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
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
    <div className="relative min-height-screen bg-[#fbfcf8] dark:bg-[#070c08] text-[#18211c] dark:text-white overflow-hidden flex flex-col justify-between py-12 px-6 sm:px-12 transition-colors duration-300">
      {/* Hide default layout header/footer */}
      <style dangerouslySetInnerHTML={{ __html: `
        .site-header, .site-footer { display: none !important; }
      `}} />

      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#009b98] opacity-[0.04] dark:opacity-[0.08] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#009b98] opacity-[0.02] dark:opacity-[0.05] blur-[120px] pointer-events-none" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-[#009b98]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray="200 40" />
            <circle cx="50" cy="50" r="10" fill="currentColor" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-[#18211c] dark:text-white">
            after<span className="text-[#009b98]">service</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-white dark:bg-[#111814] border border-[#dfe5dc] dark:border-[#1f3026] hover:border-[#009b98]/40 transition-all duration-200 shadow-sm"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[#009b98]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <span className="text-xs bg-[#eef8f0] dark:bg-[#122118] border border-[#a9d3b7] dark:border-[#1b3d2b] text-[#24583a] dark:text-[#54c08b] px-3 py-1 rounded-full font-medium tracking-wide">
            PRE-LAUNCH
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto w-full text-center flex-1 flex flex-col justify-center my-16">
        {/* Glow pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#eef8f0] dark:bg-[#122118] border border-[#a9d3b7] dark:border-[#1b3d2b] text-sm text-[#24583a] dark:text-[#009b98] font-medium mx-auto mb-8 hover:border-[#009b98]/40 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-[#009b98] animate-pulse" />
          <span>Private Beta Launching Summer 2026</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#18211c] dark:text-white mb-6 leading-[1.05]">
          The After-Service Engine <br className="hidden sm:inline" />
          for Local Operators
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-[#55625b] dark:text-[#8fa397] max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop losing clients after the job is done. afterservice automates customer check-ins, drives 5-star reviews, and triggers repeat bookings while you focus on your trade.
        </p>

        {/* Waitlist Box */}
        <div className="max-w-md mx-auto w-full mb-16">
          {submitted ? (
            <div className="bg-[#eef8f0]/80 dark:bg-[#122118]/80 border border-[#a9d3b7] dark:border-[#1b3d2b] rounded-2xl p-6 backdrop-blur-md shadow-2xl animate-fade-in transition-colors duration-300">
              <div className="w-12 h-12 rounded-full bg-[#009b98]/10 dark:bg-[#009b98]/20 border border-[#009b98]/30 dark:border-[#009b98]/40 flex items-center justify-center mx-auto mb-4 text-[#009b98]">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#18211c] dark:text-white mb-2">You're on the list!</h3>
              <p className="text-sm text-[#55625b] dark:text-[#8fa397]">
                Thank you for joining. We will notify you as soon as our private beta opens.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#111814]/60 p-2 border border-[#dfe5dc] dark:border-[#1f3026] rounded-2xl shadow-2xl backdrop-blur-md transition-colors duration-300">
              <input
                type="email"
                placeholder="Enter your work email..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-transparent text-[#18211c] dark:text-white border-0 outline-none focus:ring-0 placeholder-[#8ca094] dark:placeholder-[#566e60] text-base"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#009b98] hover:bg-[#00b0ad] active:scale-[0.98] text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#009b98]/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Joining...</span>
                  </>
                ) : (
                  <span>Request Invite</span>
                )}
              </button>
            </form>
          )}
          {error && <p className="text-red-500 dark:text-red-400 text-sm mt-3 text-left pl-3">{error}</p>}
        </div>

        {/* Feature Teaser Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white dark:bg-[#111814]/40 border border-[#dfe5dc] dark:border-[#1f3026] hover:border-[#009b98]/40 p-6 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300 backdrop-blur-sm group">
            <div className="w-10 h-10 rounded-xl bg-[#f0faf8] dark:bg-[#122118] border border-[#d7f3ed] dark:border-[#1b3d2b] flex items-center justify-center mb-4 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#18211c] dark:text-white">Smart Check-Ins</h3>
            <p className="text-sm text-[#55625b] dark:text-[#8fa397] leading-relaxed">
              Autosend follow-up text or email requests after service job completions to gauge satisfaction before reviews are posted.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111814]/40 border border-[#dfe5dc] dark:border-[#1f3026] hover:border-[#009b98]/40 p-6 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300 backdrop-blur-sm group">
            <div className="w-10 h-10 rounded-xl bg-[#f0faf8] dark:bg-[#122118] border border-[#d7f3ed] dark:border-[#1b3d2b] flex items-center justify-center mb-4 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.88a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.88a1 1 0 00-1.176 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.88c-.773-.568-.375-1.81.587-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#18211c] dark:text-white">5-Star Reviews</h3>
            <p className="text-sm text-[#55625b] dark:text-[#8fa397] leading-relaxed">
              Target happy customers to review your business directly on Google, Local Services Ads, and Yelp to boost your SEO.
            </p>
          </div>

          <div className="bg-white dark:bg-[#111814]/40 border border-[#dfe5dc] dark:border-[#1f3026] hover:border-[#009b98]/40 p-6 rounded-2xl shadow-sm dark:shadow-none transition-all duration-300 backdrop-blur-sm group">
            <div className="w-10 h-10 rounded-xl bg-[#f0faf8] dark:bg-[#122118] border border-[#d7f3ed] dark:border-[#1b3d2b] flex items-center justify-center mb-4 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.21" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2 text-[#18211c] dark:text-white">Repeat Bookings</h3>
            <p className="text-sm text-[#55625b] dark:text-[#8fa397] leading-relaxed">
              Schedule seasonal check-ins, service intervals, or warranty extensions dynamically based on customer service history.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center text-xs text-[#7c8e82] dark:text-[#566e60] mt-16 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 afterservice. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-[#18211c] dark:hover:text-white transition-colors duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-[#18211c] dark:hover:text-white transition-colors duration-200">Terms of Service</a>
          <a href="mailto:hello@afterservice.app" className="hover:text-[#18211c] dark:hover:text-white transition-colors duration-200">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
