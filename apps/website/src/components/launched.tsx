"use client";

import { useState } from "react";

export function LaunchedPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");

  const faqs = [
    {
      q: "How does afterservice integrate with my existing workflow?",
      a: "afterservice integrates directly with your existing field management tools or CRMs via API and Zapier. You can also log jobs directly in our lightweight operator dashboard in under 10 seconds."
    },
    {
      q: "Can my field staff use this on the go?",
      a: "Yes! The operator dashboard is fully optimized for mobile devices. Staff can easily complete a job, add customer details, and schedule follow-ups from their phones while still in the field."
    },
    {
      q: "How does the private dispute resolution work?",
      a: "When a check-in message is sent, the customer is prompted to rate their experience. Ratings of 4 or 5 stars are instantly routed to your public Google, Yelp, or Facebook pages. Ratings under 4 stars open a private feedback channel, allowing you to resolve issues before they become public reviews."
    },
    {
      q: "What channels are supported for follow-ups?",
      a: "Currently, we support email and SMS messaging. WhatsApp and automated phone outreach are currently in private beta and will be rolled out to Growth and Pro plans soon."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#070c08] text-white overflow-hidden flex flex-col justify-between">
      {/* Hide default layout header/footer */}
      <style dangerouslySetInnerHTML={{ __html: `
        .site-header, .site-footer { display: none !important; }
      `}} />

      {/* Background radial gradients for high-end glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#009b98] opacity-[0.07] blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#009b98] opacity-[0.05] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-[#009b98] opacity-[0.06] blur-[150px] pointer-events-none" />

      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#1f3026] bg-[#070c08]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#009b98]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray="200 40" />
              <circle cx="50" cy="50" r="10" fill="currentColor" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-white">
              after<span className="text-[#009b98]">service</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#8fa397]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium text-[#8fa397] hover:text-white transition-colors">
              Sign In
            </a>
            <a 
              href="/signup" 
              className="px-4 py-2 bg-[#009b98] hover:bg-[#00b0ad] active:scale-[0.98] text-white text-sm font-bold rounded-lg transition-all shadow-md shadow-[#009b98]/10"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#122118] border border-[#1b3d2b] text-sm text-[#009b98] font-medium mb-8 hover:border-[#009b98]/40 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-[#009b98] animate-pulse" />
          <span>v1.0 is officially live for operators</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-5xl mx-auto leading-[1.05]">
          Turn Every Service Job Into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009b98] via-[#4bbbaa] to-[#a9d3b7]">
            Customer Lifetime Value
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-[#8fa397] max-w-3xl mx-auto mb-10 leading-relaxed">
          The post-service automation platform built for plumbers, HVAC techs, electricians, and local operators. Automatically follow up, collect 5-star reviews, resolve disputes privately, and reactivate repeat bookings.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <a 
            href="/signup" 
            className="w-full sm:w-auto px-8 py-4 bg-[#009b98] hover:bg-[#00b0ad] active:scale-[0.98] text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#009b98]/20 flex items-center justify-center gap-2"
          >
            <span>Start Your 14-Day Free Trial</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <a 
            href="#pricing" 
            className="w-full sm:w-auto px-8 py-4 bg-[#111814]/80 border border-[#1f3026] hover:border-[#009b98]/40 text-[#8fa397] hover:text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center"
          >
            See Pricing & Plans
          </a>
        </div>

        {/* Dashboard Showcase Mockup */}
        <div className="relative max-w-5xl mx-auto bg-[#0d1410] border border-[#1f3026] rounded-2xl p-4 shadow-2xl backdrop-blur-sm overflow-hidden group">
          {/* Decorative browser dots */}
          <div className="flex items-center gap-2 mb-4 border-b border-[#1b3d2b] pb-3">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-xs text-[#566e60] font-mono">dashboard.afterservice.app</span>
          </div>

          {/* Dummy UI Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="md:col-span-1 border-r border-[#1b3d2b] pr-4 hidden md:flex flex-col gap-3 text-xs text-[#8fa397]">
              <div className="p-2 rounded bg-[#122118] text-[#009b98] font-bold">🎯 Follow-Up Board</div>
              <div className="p-2 hover:bg-[#122118]/40 rounded transition-colors">👥 Customers</div>
              <div className="p-2 hover:bg-[#122118]/40 rounded transition-colors">💼 Jobs & Tickets</div>
              <div className="p-2 hover:bg-[#122118]/40 rounded transition-colors">📝 Templates</div>
              <div className="p-2 hover:bg-[#122118]/40 rounded transition-colors">⚙️ Settings</div>
            </div>

            <div className="md:col-span-3 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#1b3d2b] pb-2">
                <h4 className="font-bold text-[#009b98]">Active Follow-Up Pipeline</h4>
                <span className="text-xs text-[#566e60]">Updated just now</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#122118]/50 border border-[#1b3d2b] p-3 rounded-xl flex flex-col justify-between min-h-32">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-yellow-500 px-2 py-0.5 rounded bg-yellow-950/30 border border-yellow-800/40">DUE TODAY</span>
                    <h5 className="font-bold text-sm mt-2">HVAC Maintenance</h5>
                    <p className="text-xs text-[#8fa397]">John Doe - Rapid Cooling</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-[#566e60]">SMS Queued</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  </div>
                </div>

                <div className="bg-[#122118]/50 border border-[#1b3d2b] p-3 rounded-xl flex flex-col justify-between min-h-32">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#009b98] px-2 py-0.5 rounded bg-[#009b98]/10 border border-[#009b98]/20">SENT</span>
                    <h5 className="font-bold text-sm mt-2">Plumbing Install</h5>
                    <p className="text-xs text-[#8fa397]">Sarah Smith - Shower Leak</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-[#566e60]">Sent 2h ago</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#009b98]" />
                  </div>
                </div>

                <div className="bg-[#122118]/50 border border-[#1b3d2b] p-3 rounded-xl flex flex-col justify-between min-h-32">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-green-500 px-2 py-0.5 rounded bg-green-950/30 border border-green-800/40">REPLIED</span>
                    <h5 className="font-bold text-sm mt-2">Electrical Panel</h5>
                    <p className="text-xs text-[#8fa397]">Robert Lee - Breaker Box</p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] text-green-400 font-bold">5-Star Review Left</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="relative z-10 border-y border-[#1f3026] bg-[#0b100d]/60 py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">$48M+</h3>
            <p className="text-xs sm:text-sm text-[#8fa397] uppercase tracking-wider font-semibold">Service Revenue Tracked</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#009b98] mb-2">+31%</h3>
            <p className="text-xs sm:text-sm text-[#8fa397] uppercase tracking-wider font-semibold">Repeat Booking Rate</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">14,200+</h3>
            <p className="text-xs sm:text-sm text-[#8fa397] uppercase tracking-wider font-semibold">5-Star Reviews Driven</p>
          </div>
          <div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#009b98] mb-2">99.2%</h3>
            <p className="text-xs sm:text-sm text-[#8fa397] uppercase tracking-wider font-semibold">Conflict Resolution Rate</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Built for Local Service Experts
          </h2>
          <p className="text-[#8fa397] max-w-xl mx-auto">
            Everything you need to automate check-ins, build trust, and ensure customers call you first next time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#111814]/40 border border-[#1f3026] hover:border-[#009b98]/40 p-8 rounded-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#122118] border border-[#1b3d2b] flex items-center justify-center mb-6 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Automated Check-Ins</h3>
            <p className="text-[#8fa397] leading-relaxed text-sm">
              Instantly send personalized follow-up texts or emails once a job is finished. No manual input, no writing messages.
            </p>
          </div>

          <div className="bg-[#111814]/40 border border-[#1f3026] hover:border-[#009b98]/40 p-8 rounded-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#122118] border border-[#1b3d2b] flex items-center justify-center mb-6 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.242.588 1.81l-3.97 2.88a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.88a1 1 0 00-1.176 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.88c-.773-.568-.375-1.81.587-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Google Review Funnel</h3>
            <p className="text-[#8fa397] leading-relaxed text-sm">
              Happy customers are automatically routed to your Google and Yelp pages to leave glowing reviews, dramatically boosting your SEO.
            </p>
          </div>

          <div className="bg-[#111814]/40 border border-[#1f3026] hover:border-[#009b98]/40 p-8 rounded-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#122118] border border-[#1b3d2b] flex items-center justify-center mb-6 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Private Conflict Resolution</h3>
            <p className="text-[#8fa397] leading-relaxed text-sm">
              If a client had an issue, they are directed to a private form to speak directly with you. Resolve disputes privately before they hurt your public rating.
            </p>
          </div>

          <div className="bg-[#111814]/40 border border-[#1f3026] hover:border-[#009b98]/40 p-8 rounded-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#122118] border border-[#1b3d2b] flex items-center justify-center mb-6 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.21" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Repeat Visit Reminders</h3>
            <p className="text-[#8fa397] leading-relaxed text-sm">
              Schedule smart seasonal maintenance alerts, follow-up inspection prompts, or warranty checks based on the job completed.
            </p>
          </div>

          <div className="bg-[#111814]/40 border border-[#1f3026] hover:border-[#009b98]/40 p-8 rounded-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#122118] border border-[#1b3d2b] flex items-center justify-center mb-6 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Staff Leaderboards</h3>
            <p className="text-[#8fa397] leading-relaxed text-sm">
              See which technician or operator drives the most 5-star reviews and has the highest customer satisfaction scores.
            </p>
          </div>

          <div className="bg-[#111814]/40 border border-[#1f3026] hover:border-[#009b98]/40 p-8 rounded-2xl transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#122118] border border-[#1b3d2b] flex items-center justify-center mb-6 text-[#009b98] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Grade Security</h3>
            <p className="text-[#8fa397] leading-relaxed text-sm">
              Role-based workspace scopes protect customer data. Secure authentication keeps your client list locked down.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 bg-[#0b100d]/40 border-y border-[#1f3026] py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Three Steps to Automated Success
            </h2>
            <p className="text-[#8fa397] max-w-xl mx-auto">
              How afterservice saves time and generates recurring work in the background.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#122118] border border-[#1b3d2b] flex items-center justify-center text-xl font-bold text-[#009b98] mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Job Completion</h3>
              <p className="text-sm text-[#8fa397] max-w-xs leading-relaxed">
                Log a job in your dashboard or let your existing CRM signal completion automatically.
              </p>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#122118] border border-[#1b3d2b] flex items-center justify-center text-xl font-bold text-[#009b98] mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Automated Dispatch</h3>
              <p className="text-sm text-[#8fa397] max-w-xs leading-relaxed">
                Our follow-up engine sends an email or text template customized to the job type.
              </p>
            </div>

            <div className="text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#122118] border border-[#1b3d2b] flex items-center justify-center text-xl font-bold text-[#009b98] mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Growth & Reactivation</h3>
              <p className="text-sm text-[#8fa397] max-w-xs leading-relaxed">
                Collect Google reviews directly, while our scheduler plans your next maintenance alert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Transparent, ROI-Driven Pricing
          </h2>
          <p className="text-[#8fa397] max-w-lg mx-auto mb-8">
            Choose the plan that matches your business size. Save 20% by billing annually.
          </p>

          {/* Pricing Cycle Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-[#111814] border border-[#1f3026] mb-12">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "monthly" ? "bg-[#009b98] text-white" : "text-[#8fa397] hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === "annually" ? "bg-[#009b98] text-white" : "text-[#8fa397] hover:text-white"}`}
            >
              Annually (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Plan 1 */}
          <div className="bg-[#111814]/40 border border-[#1f3026] p-8 rounded-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <span className="text-xs font-bold text-[#009b98] tracking-widest uppercase">STARTER</span>
              <h3 className="text-2xl font-bold mt-2">Starter Plan</h3>
              <p className="text-sm text-[#8fa397] mt-2">Perfect for independent owner-operators.</p>
              
              <div className="my-6">
                <span className="text-5xl font-extrabold text-white">
                  ${billingCycle === "monthly" ? "49" : "39"}
                </span>
                <span className="text-sm text-[#8fa397]"> / month</span>
              </div>

              <ul className="space-y-3.5 text-sm text-[#8fa397] border-t border-[#1b3d2b] pt-6">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Up to 100 customers
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Email follow-ups
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Standard review routing
                </li>
                <li className="flex items-center gap-2.5 opacity-40">
                  <svg className="w-4 h-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  SMS check-ins
                </li>
              </ul>
            </div>
            <a 
              href="/signup" 
              className="mt-8 block w-full text-center px-4 py-3 bg-[#122118] border border-[#1b3d2b] hover:border-[#009b98]/40 hover:bg-[#122118]/80 text-[#009b98] hover:text-white font-bold rounded-xl transition-all"
            >
              Get Started
            </a>
          </div>

          {/* Plan 2 - Featured */}
          <div className="bg-[#111814]/80 border-2 border-[#009b98] p-8 rounded-2xl flex flex-col justify-between relative shadow-2xl shadow-[#009b98]/10 transform md:-translate-y-2">
            <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#009b98] text-white text-[10px] uppercase font-extrabold px-3 py-1 rounded-full tracking-wider">
              MOST POPULAR
            </span>
            <div>
              <span className="text-xs font-bold text-[#009b98] tracking-widest uppercase">GROWTH</span>
              <h3 className="text-2xl font-bold mt-2">Growth Plan</h3>
              <p className="text-sm text-[#8fa397] mt-2">Ideal for expanding residential teams.</p>
              
              <div className="my-6">
                <span className="text-5xl font-extrabold text-white">
                  ${billingCycle === "monthly" ? "99" : "79"}
                </span>
                <span className="text-sm text-[#8fa397]"> / month</span>
              </div>

              <ul className="space-y-3.5 text-sm text-[#8fa397] border-t border-[#1b3d2b] pt-6">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Up to 1,000 customers
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  SMS & Email outreach
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Private dispute resolver
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Up to 5 team seats
                </li>
              </ul>
            </div>
            <a 
              href="/signup" 
              className="mt-8 block w-full text-center px-4 py-3 bg-[#009b98] hover:bg-[#00b0ad] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-md shadow-[#009b98]/20"
            >
              Start Free Trial
            </a>
          </div>

          {/* Plan 3 */}
          <div className="bg-[#111814]/40 border border-[#1f3026] p-8 rounded-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <span className="text-xs font-bold text-[#009b98] tracking-widest uppercase">PRO</span>
              <h3 className="text-2xl font-bold mt-2">Pro Plan</h3>
              <p className="text-sm text-[#8fa397] mt-2">Built for multi-region operators.</p>
              
              <div className="my-6">
                <span className="text-5xl font-extrabold text-white">
                  ${billingCycle === "monthly" ? "199" : "159"}
                </span>
                <span className="text-sm text-[#8fa397]"> / month</span>
              </div>

              <ul className="space-y-3.5 text-sm text-[#8fa397] border-t border-[#1b3d2b] pt-6">
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Unlimited customers
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  All messaging channels
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Advanced automation hooks
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-[#009b98] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Unlimited team seats
                </li>
              </ul>
            </div>
            <a 
              href="/signup" 
              className="mt-8 block w-full text-center px-4 py-3 bg-[#122118] border border-[#1b3d2b] hover:border-[#009b98]/40 hover:bg-[#122118]/80 text-[#009b98] hover:text-white font-bold rounded-xl transition-all"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="relative z-10 max-w-4xl mx-auto w-full px-6 sm:px-8 py-24 border-t border-[#1f3026]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#8fa397]">
            Find answers to common questions about setting up and running afterservice.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#111814]/40 border border-[#1f3026] rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-lg hover:text-[#009b98] transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`transform transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`}>
                  <svg className="w-5 h-5 text-[#009b98]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${activeFaq === idx ? "max-h-48 border-t border-[#1b3d2b]" : "max-h-0"}`}
              >
                <p className="p-6 text-sm text-[#8fa397] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-6xl mx-auto w-full px-6 sm:px-8 pb-32 pt-16">
        <div className="bg-gradient-to-r from-[#111814]/80 to-[#122118]/80 border border-[#1f3026] rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[-50%] w-[100%] h-[100%] rounded-full bg-[#009b98]/10 blur-[100px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Ready to Reactivate <br className="sm:hidden" /> Your Customer Base?
          </h2>
          <p className="text-[#8fa397] max-w-xl mx-auto mb-8 text-base">
            Start protecting your online reputation and driving organic referral and repeat jobs today. Setting up takes minutes.
          </p>
          <a 
            href="/signup" 
            className="inline-flex px-8 py-4 bg-[#009b98] hover:bg-[#00b0ad] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#009b98]/20 text-base"
          >
            Start Your 14-Day Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#1f3026] bg-[#070c08] py-16">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#009b98]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray="200 40" />
              <circle cx="50" cy="50" r="10" fill="currentColor" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-white">
              after<span className="text-[#009b98]">service</span>
            </span>
          </div>

          <div className="text-xs text-[#566e60] text-center md:text-left">
            <p>© 2026 afterservice. All rights reserved.</p>
            <p className="mt-1">Built for local operators in the USA & Canada.</p>
          </div>

          <div className="flex gap-6 text-xs text-[#566e60]">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:hello@afterservice.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
