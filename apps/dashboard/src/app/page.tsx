import { getAppUrls } from "@afterservice/utils";

export default function DashboardPage() {
  const urls = getAppUrls();

  return (
    <main>
      afterservice dashboard
      <a href={urls.site}>Back to website</a>
    </main>
  );
}
