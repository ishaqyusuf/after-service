import { getAppUrls } from "@afterservice/utils";

export default function SignupPage() {
  const urls = getAppUrls();

  return (
    <main>
      <h1>Sign up</h1>
      <p>Workspace onboarding will begin from the dashboard app.</p>
      <a href={`${urls.dashboard}/sign-up`}>Create workspace</a>
    </main>
  );
}
