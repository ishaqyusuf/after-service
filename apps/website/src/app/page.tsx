import { isLaunched } from "@afterservice/utils";
import { LaunchedPage } from "../components/launched";
import { PreLaunchPage } from "../components/pre-launch";

export default function HomePage() {
  const launched = isLaunched();

  if (!launched) {
    return <LaunchedPage />;
  }

  return <PreLaunchPage />;
}
