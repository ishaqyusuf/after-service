import { getAppUrls } from "@afterservice/utils";

export default function HomePage() {
  const urls = getAppUrls();

  return (
    <main className="site-page">
      <h1>afterservice</h1>
      <p>Follow-up software for local service operators.</p>
      <a href={urls.dashboard}>Open dashboard</a>
    </main>
  );
}
