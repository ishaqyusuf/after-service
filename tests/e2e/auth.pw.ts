import { expect, signOut, test, validateEmptyForm } from "./fixtures";

test("signup, onboarding, session persistence, sign-in and safe return path", async ({
  page,
  identity,
}) => {
  await page.goto("/sign-up");
  await validateEmptyForm(page, "Create account", "Name");
  await page.getByLabel("Name", { exact: true }).fill("Browser Operator");
  await page.getByLabel("Email", { exact: true }).fill(identity.email);
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Password must be at least 8 characters."),
  ).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill(identity.password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/onboarding/);
  await validateEmptyForm(page, "Create workspace", "Business name");
  await expect(
    page.getByText("Business name is required", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Business name", { exact: true }).fill("afterservice");
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(
    page.getByText(
      "Use your business name instead of a reserved afterservice name",
    ),
  ).toBeVisible();
  await page
    .getByLabel("Business name", { exact: true })
    .fill(identity.workspaceName);
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(page).not.toHaveURL(/\/onboarding/);
  await page.waitForLoadState("networkidle");
  await page.goto("/customers");
  await expect(page.getByPlaceholder("Search customers...")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(page.getByPlaceholder("Search customers...")).toBeVisible();
  await signOut(page);
  await page.goto("/customers");
  await expect(page).toHaveURL(/\/sign-in\?return_to=/);
  await validateEmptyForm(page, "Sign in", "Email");
  await page.getByLabel("Email", { exact: true }).fill(identity.email);
  await page.getByLabel("Password", { exact: true }).fill(identity.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/customers/);
  await signOut(page);
  await expect(page).toHaveURL(/\/sign-in/);
  await page.goto("/customers");
  await expect(page).toHaveURL(/\/sign-in\?return_to=/);
});

test("invalid login remains on auth screen with a useful error", async ({
  page,
  identity,
}) => {
  await page.goto("/sign-in?return_to=https%3A%2F%2Fevil.example");
  await validateEmptyForm(page, "Sign in", "Email");
  await page.getByLabel("Email", { exact: true }).fill(identity.email);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(
    page.getByText("https://evil.example", { exact: true }),
  ).toHaveCount(0);
});

test("cookie presence alone cannot authorize a protected page", async ({
  page,
  baseURL,
}) => {
  await page.context().addCookies([
    {
      name: "better-auth.session_token",
      value: "forged.invalid",
      url: baseURL,
    },
  ]);
  await page.goto("/customers");
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByPlaceholder("Search customers...")).toHaveCount(0);
});

test("authenticated auth-page redirects accept only safe local destinations", async ({
  page,
  operator: _operator,
}) => {
  await page.goto("/sign-in?return_to=%2Fcustomers");
  await expect(page).toHaveURL(/\/customers$/);
  for (const destination of [
    "//evil.example",
    "/\\evil.example",
    "/sign-in",
    "https://evil.example",
  ]) {
    await page.goto(`/sign-in?return_to=${encodeURIComponent(destination)}`);
    await expect(page).toHaveURL(
      /^https?:\/\/app-afterservice\.localhost(?::\d+)?\/$/,
    );
  }
});
