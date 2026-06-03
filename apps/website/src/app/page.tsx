import { isLaunched } from "@afterservice/utils";
import type { Metadata } from "next";
import { LaunchedPage } from "../components/launched";
import { PreLaunchPage } from "../components/pre-launch";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "After Service | The workflow for what happens next",
    description: "Manage customers, log jobs, and automate your follow-ups.",
  };
}

export default async function HomePage() {
  const launched = isLaunched();

  if (!launched) {
    return <LaunchedPage />;
  }

  return <PreLaunchPage />;
}
