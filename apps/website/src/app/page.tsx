import type { Metadata } from "next";
import { LaunchedPage } from "../components/launched";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "afterservice | Post-job follow-up board for service shops",
    description:
      "Join the free beta for a manual-first follow-up board built for repair shops, installers, contractors, and local service teams.",
  };
}

export default async function HomePage() {
  return <LaunchedPage />;
}
