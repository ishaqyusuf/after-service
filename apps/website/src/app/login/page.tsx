import { getAppUrls } from "@afterservice/utils";

export default function LoginPage() {
  const urls = getAppUrls();

  return (
    <main>
      <h1>Log in</h1>
      <p>Dashboard authentication will connect here in the auth phase.</p>
      <a href={`${urls.dashboard}/sign-in`}>Continue to dashboard login</a>
    </main>
  );
}
