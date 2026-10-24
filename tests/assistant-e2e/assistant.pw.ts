import { expect, test } from "../e2e/fixtures";

test.beforeEach(async ({ page }) => {
  // Only the model is replaced. The real streaming runtime, tools, database,
  // authorization and confirmation endpoints execute unchanged.
  await page.route("**/api/assistant/chat", async (route) => {
    const headers = await route.request().allHeaders();
    const response = await route.fetch({
      url: "http://127.0.0.1:4199/chat",
      headers,
    });
    await route.fulfill({ response });
  });
});
test("assistant drafts, edits, confirms and reloads a customer; message drafts remain unsent", async ({
  page,
  operator,
}, info) => {
  expect(operator.workspaceId).toBeTruthy();
  await page.goto("/assistant");
  await expect(
    page.getByRole("heading", { name: "Assistant", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Message assistant")).toBeVisible();
  await page
    .getByLabel("Message assistant")
    .fill("Add a customer named Assistant Browser Customer");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("Add customer", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page
    .getByLabel("Name", { exact: true })
    .fill("Assistant Browser Reviewed");
  await page.getByRole("button", { name: "Save draft changes" }).click();
  await expect(
    page.getByText("Assistant Browser Reviewed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Saved — open record" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Saved — open record" }),
  ).toBeVisible();
  await page
    .getByLabel("Message assistant")
    .fill("Draft a friendly post-service check-in");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByLabel("Post-service check-in draft")).toBeVisible();
  await expect(
    page.getByText("Draft only. No message has been sent.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("assistant-reviewed-customer.png"),
    fullPage: true,
  });
  const link = page.getByRole("link", { name: "Saved — open record" });
  await link.click();
  await expect(page.getByLabel("Name", { exact: true })).toHaveValue(
    "Assistant Browser Reviewed",
  );
});
test("workload cards, conversation history, minimize/reopen and mobile fit", async ({
  page,
  operator,
}, info) => {
  expect(operator.workspaceId).toBeTruthy();
  await page.goto("/customers");
  await page
    .getByRole("button", { name: "Open assistant", exact: true })
    .click();
  await page
    .getByLabel("Message assistant")
    .fill("What needs attention today?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByText("Today's workload", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Message assistant").fill("Keep this unsent draft");
  await page
    .getByRole("button", { name: "Minimize assistant", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Open assistant", exact: true })
    .click();
  await expect(page.getByLabel("Message assistant")).toHaveValue(
    "Keep this unsent draft",
  );
  await page
    .getByLabel("Message assistant")
    .fill("Draft a friendly post-service check-in");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page
    .getByLabel("Post-service check-in draft")
    .fill("Keep this edited message draft.");
  await page
    .getByRole("button", { name: "Minimize assistant", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Open assistant", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Open assistant", exact: true })
    .click();
  await expect(page.getByLabel("Post-service check-in draft")).toHaveValue(
    "Keep this edited message draft.",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
  await page.screenshot({
    path: info.outputPath("assistant-workload-panel.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Rename", exact: true }).click();
  await page.getByLabel("Conversation title").fill("Today's operations");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByLabel("Saved conversations")).toContainText(
    "Today's operations",
  );
  await page
    .getByRole("button", { name: "New conversation", exact: true })
    .click();
  await expect(
    page.getByText("What needs attention?", { exact: true }),
  ).toBeVisible();
});

test("onboarding has curated help before workspace creation", async ({
  page,
  identity,
  baseURL,
}) => {
  const signup = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: baseURL ?? "" },
    data: { ...identity, name: "Browser Setup Operator" },
  });
  expect(signup.ok()).toBeTruthy();
  await page.goto("/onboarding");
  await page
    .getByText("Help setting up your workspace", { exact: true })
    .click();
  await expect(
    page.getByText("This creates a reminder to work on the board", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open assistant", exact: true }),
  ).toHaveCount(0);
});

test("reply failure preserves input, retry recovers, quota stops generation and chat deletion works", async ({
  page,
  operator,
}) => {
  await page.goto("/assistant");
  await expect(page.getByLabel("Message assistant")).toBeVisible();
  await page.route(
    "**/api/assistant/chat",
    async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: "The AI provider is unavailable. Try again.",
        }),
      });
    },
    { times: 1 },
  );
  await page
    .getByLabel("Message assistant")
    .fill("What needs attention today?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "AI provider is unavailable" }),
  ).toContainText("AI provider is unavailable");
  await expect(page.getByLabel("Message assistant")).toHaveValue(
    "What needs attention today?",
  );
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(
    page.getByText("Today's workload", { exact: true }),
  ).toBeVisible();
  const { localTestDb } = await import("../support/local-db");
  const db = localTestDb();
  const month = new Date().toISOString().slice(0, 7);
  await db.assistantUsage.upsert({
    where: { workspaceId_month: { workspaceId: operator.workspaceId, month } },
    create: { workspaceId: operator.workspaceId, month, tokens: 1000000 },
    update: { tokens: 1000000, reservedTokens: 0 },
  });
  await page.reload();
  await page.getByLabel("Message assistant").fill("This must not generate");
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeDisabled();
  await expect(page.getByText(/^0 tokens available/)).toBeVisible();
  await page
    .getByRole("button", { name: "Delete conversation", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete chat", exact: true }).click();
  await expect(
    page.getByText("What needs attention?", { exact: true }),
  ).toBeVisible();
});
