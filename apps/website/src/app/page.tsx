import type { Metadata } from "next";
import { LaunchedPage } from "../components/launched";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "After Service | The workflow for what happens next",
    description: "Manage customers, log jobs, and automate your follow-ups.",
  };
}

export default async function HomePage() {
  return <LaunchedPage />;
}
