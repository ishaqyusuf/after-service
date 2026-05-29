import { isLaunched } from "@afterservice/utils";
import { PreLaunchPage } from "../components/pre-launch";
import { LaunchedPage } from "../components/launched";

export default function HomePage() {
  const launched = isLaunched();

  if (launched) {
    return <LaunchedPage />;
  }

  return <PreLaunchPage />;
}

