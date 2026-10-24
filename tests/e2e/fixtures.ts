import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import { test as base, expect, type Page } from "@playwright/test";

type Identity = { email: string; password: string; workspaceName: string };
type Operator = Identity & { workspaceId: string };

export const test = base.extend<{
  identity: Identity;
  operator: Operator;
  browserErrors: undefined;
}>({
  browserErrors: [
    async ({ page, browserName }, use, testInfo) => {
      const errors: string[] = [];
      const onError = (error: Error) => {
        if (
          browserName === "webkit" &&
          error.message.includes(
            "/__nextjs_original-stack-frames due to access control checks.",
          ) &&
          error.stack?.includes("next-devtools")
        ) {
          testInfo.annotations.push({
            type: "next-devtools",
            description:
              "WebKit developer-overlay diagnostic fetch failed during a streamed redirect.",
          });
          return;
        }
        errors.push(error.message);
      };
      page.on("pageerror", onError);
      await use(undefined);
      page.off("pageerror", onError);
      expect(errors, "Uncaught browser errors").toEqual([]);
    },
    { auto: true },
  ],
  // Playwright requires a destructured fixture argument, including when unused.
  // biome-ignore lint/correctness/noEmptyPattern: no fixture dependencies
  identity: async ({}, use) => {
    const id = randomUUID();
    const identity = {
      email: `browser-${id}@afterservice.invalid`,
      password: `Browser-${id}!`,
      workspaceName: `Browser Workshop ${id.slice(0, 8)}`,
    };
    try {
      await use(identity);
    } finally {
      await promisify(execFile)("bun", [
        "--env-file=/dev/null",
        "tests/support/cleanup-browser-user.ts",
        identity.email,
      ]);
    }
  },
  operator: async ({ page, identity, baseURL }, use) => {
    const signup = await page.request.post("/api/auth/sign-up/email", {
      headers: { origin: baseURL ?? "" },
      data: { ...identity, name: "Browser Operator" },
    });
    expect(signup.ok(), await signup.text()).toBeTruthy();
    const onboarding = await page.request.post("/api/onboarding", {
      headers: { origin: baseURL ?? "" },
      data: {
        businessName: identity.workspaceName,
        defaultFollowUpDelayDays: 7,
      },
    });
    expect(onboarding.ok(), await onboarding.text()).toBeTruthy();
    const result = await onboarding.json();
    await use({ ...identity, workspaceId: result.workspace.id });
  },
});

export { expect };

export async function selectOption(page: Page, label: string, option: string) {
  await page.getByRole("dialog").getByLabel(label, { exact: true }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

export async function showBoardStage(page: Page, stage: string) {
  const stages = page.getByRole("group", { name: "Show follow-up stage" });
  if (await stages.isVisible()) {
    await stages
      .getByRole("button", { name: new RegExp(`^${stage}\\s`) })
      .click();
  }
}

export async function signOut(page: Page) {
  // Finish background preference writes before leaving the authenticated page.
  await page.waitForLoadState("networkidle");
  const item = page.getByRole("menuitem", { name: "Sign out", exact: true });
  // SSR renders the trigger before its pointer handler hydrates in some engines.
  // Retry opening the menu; the sign-out mutation itself runs only once.
  await expect(async () => {
    if (!(await item.isVisible())) {
      await page
        .getByRole("banner")
        .getByRole("button", { name: "Open account menu", exact: true })
        .click();
    }
    await expect(item).toBeVisible({ timeout: 750 });
  }).toPass({ timeout: 15_000 });
  await item.click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.waitForLoadState("networkidle");
}

export async function validateEmptyForm(
  page: Page,
  submit: string,
  field: string,
) {
  // Validate an empty form to establish that its React handlers are ready.
  // No valid account/workspace mutation is retried.
  await expect(async () => {
    await page.getByRole("button", { name: submit, exact: true }).click();
    await expect(page.getByLabel(field, { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
      { timeout: 750 },
    );
  }).toPass({ timeout: 15_000 });
}

export async function createCustomer(page: Page, name = "Amina Browser") {
  await page.goto("/customers?createCustomer=true");
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Name", { exact: true }).fill(name);
  await sheet
    .getByLabel("Email (optional)")
    .fill("customer@afterservice.invalid");
  await sheet.getByLabel("Phone (optional)").fill("555-0100");
  await sheet
    .getByRole("button", { name: "Create customer", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  await expect(page.getByRole("row").filter({ hasText: name })).toBeVisible();
}
