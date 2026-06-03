import { isLaunched } from "@afterservice/utils";
import { LaunchedPage } from "../components/launched";
import { PreLaunchPage } from "../components/pre-launch";
import type { Metadata } from "next";

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
