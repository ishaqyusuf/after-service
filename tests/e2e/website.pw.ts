import { expect, test } from "./fixtures";

test("public website pages and signup/login route to the local dashboard", async ({
  page,
}, testInfo) => {
  const websiteUrl = String(testInfo.config.metadata.websiteUrl);
  for (const path of [
    "/",
    "/pricing",
    "/features",
    "/customers",
    "/privacy",
    "/terms",
  ]) {
    const response = await page.goto(`${websiteUrl}${path}`);
    expect(response?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  }
  await page.goto(`${websiteUrl}/signup`);
  await expect(page).toHaveURL(/app-afterservice\.localhost.*\/sign-up/);
  await expect(
    page.getByRole("button", { name: "Create account", exact: true }),
  ).toBeVisible();
  await page.goto(`${websiteUrl}/login`);
  await expect(page).toHaveURL(/app-afterservice\.localhost.*\/sign-in/);
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
});
