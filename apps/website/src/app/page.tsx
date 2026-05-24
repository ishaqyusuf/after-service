import { getAppUrls } from "@afterservice/utils";

export default function HomePage() {
  const urls = getAppUrls();

  return (
    <main>
      afterservice
      <a href={urls.dashboard}>Open dashboard</a>
    </main>
  );
}
