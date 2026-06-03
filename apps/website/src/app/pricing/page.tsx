import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pricing | After Service",
    description: "Starter, growth, and pro plans.",
  };
}

export default async function PricingPage() {
  return (
    <main className="site-page">
      <h1>Pricing</h1>
      <p>Starter, growth, and pro plans will be available for operators.</p>
      <a href="/signup">Start setup</a>
    </main>
  );
}
