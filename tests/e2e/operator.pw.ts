import {
  createCustomer,
  expect,
  selectOption,
  showBoardStage,
  test,
} from "./fixtures";

test("follow-ups: empty board and direct creation with an inline customer", async ({
  page,
  operator: _operator,
}) => {
  await page.goto("/follow-ups");
  await expect(
    page.getByRole("heading", { name: "No follow-ups", exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create follow-up", exact: true })
    .first()
    .click();
  const sheet = page.getByRole("dialog");
  await sheet
    .getByRole("button", { name: "Select or create customer" })
    .click();
  await page
    .getByPlaceholder(/^Search customers/)
    .last()
    .fill("Direct Browser");
  await page.getByRole("option", { name: 'Create "Direct Browser"' }).click();
  await expect(
    sheet.getByRole("button", { name: "Direct Browser" }),
  ).toBeEnabled();
  await selectOption(page, "Channel", "Phone");
  await selectOption(page, "Template", "Phone call reminder");
  await sheet
    .getByLabel("Draft / notes", { exact: true })
    .fill("Check in after the service.");
  await sheet
    .getByRole("button", { name: "Add to board", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  await showBoardStage(page, "Upcoming");
  await expect(
    page.getByRole("button", { name: /^Direct Browser .+/ }),
  ).toContainText("Check in after the service.");
  await expect(
    page.getByRole("row").filter({ hasText: "Direct Browser" }),
  ).toContainText("Scheduled");
});

test("customers: empty state, validation, create, search, edit, archive", async ({
  page,
  operator: _operator,
}) => {
  await page.goto("/customers");
  await expect(
    page.getByText("No customers yet", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add customer", exact: true })
    .first()
    .click();
  const sheet = page.getByRole("dialog");
  await sheet
    .getByRole("button", { name: "Create customer", exact: true })
    .click();
  await expect(sheet.getByText("Name is required")).toBeVisible();
  await sheet.getByLabel("Name", { exact: true }).fill("Amina Browser");
  await sheet
    .getByLabel("Email (optional)")
    .fill("customer@afterservice.invalid");
  await sheet
    .getByRole("button", { name: "Create customer", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  const row = page.getByRole("row").filter({ hasText: "Amina Browser" });
  await expect(row).toBeVisible();
  await page.getByPlaceholder(/^Search customers/).fill("no-such-customer");
  await page.getByPlaceholder(/^Search customers/).press("Enter");
  await expect(row).toHaveCount(0);
  await expect(
    page.getByText("Nothing matches these filters", { exact: true }),
  ).toBeVisible();
  await page.getByPlaceholder(/^Search customers/).fill("");
  await row.getByText("Amina Browser", { exact: true }).click();
  await sheet.getByLabel("Name", { exact: true }).fill("Amina Updated");
  await sheet
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  const updated = page.getByRole("row").filter({ hasText: "Amina Updated" });
  await expect(updated).toBeVisible();
  await updated.getByRole("button", { name: /^Actions for / }).click();
  const archived = page.waitForResponse(
    (response) =>
      response.url().includes("customers.archive") &&
      response.request().method() === "POST",
  );
  await page.getByRole("menuitem", { name: "Archive customer" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Archive customer", exact: true })
    .click();
  expect((await archived).ok()).toBe(true);
  await expect(updated).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByText("No customers yet", { exact: true }),
  ).toBeVisible();
});

test("jobs and follow-ups: create, schedule, reschedule, manual log, reply, close, table", async ({
  page,
  operator: _operator,
}) => {
  await createCustomer(page);
  await page.goto("/jobs?createJob=true");
  const sheet = page.getByRole("dialog");
  await sheet
    .getByRole("button", { name: "Select or create customer" })
    .click();
  await page
    .getByRole("option", { name: "Amina Browser", exact: true })
    .click();
  await sheet
    .getByRole("button", { name: "Select or create service title" })
    .click();
  await page
    .getByPlaceholder("Maintenance, repair, installation...")
    .fill("Browser Repair");
  await page.getByRole("option", { name: 'Create "Browser Repair"' }).click();
  await sheet.getByLabel("Amount (optional)").fill("125.50");
  await sheet.getByRole("button", { name: "Create job", exact: true }).click();
  await expect(sheet).toHaveCount(0);
  const row = page.getByRole("row").filter({ hasText: "Browser Repair" });
  await expect(row).toContainText("$125.50");
  await row.getByRole("button", { name: /^Actions for / }).click();
  await page.getByRole("menuitem", { name: "Schedule follow-up" }).click();
  await selectOption(page, "Channel", "Phone");
  await sheet
    .getByRole("button", { name: "Create follow-up", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  await page.goto("/follow-ups");
  await showBoardStage(page, "Upcoming");
  const card = page.getByRole("button", { name: /^Amina Browser .+/ });
  await expect(card).toContainText("Browser Repair");
  await card.click();
  await sheet.getByRole("tab", { name: "Reschedule", exact: true }).click();
  const previousDue = await sheet
    .getByLabel("New due date", { exact: true })
    .textContent();
  await sheet.getByLabel("New due date", { exact: true }).click();
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + 8);
  const nextDay = page.locator(
    `[data-slot="calendar"] button[data-day="${nextDue.toLocaleDateString("en-US")}"]`,
  );
  if ((await nextDay.count()) === 0) {
    await page
      .getByRole("button", { name: "Go to the Next Month", exact: true })
      .click();
  }
  await nextDay.click();
  await expect(
    sheet.getByLabel("New due date", { exact: true }),
  ).not.toHaveText(previousDue ?? "");
  // Close the date popover before submitting the enclosing sheet form.
  await page.keyboard.press("Escape");
  await sheet.getByRole("button", { name: "Reschedule", exact: true }).click();
  await expect(sheet).toHaveCount(0);
  await card.click();
  await sheet.getByRole("tab", { name: "Reschedule", exact: true }).click();
  await expect(
    sheet.getByLabel("New due date", { exact: true }),
  ).not.toHaveText(previousDue ?? "");
  await sheet.getByRole("tab", { name: "Log call", exact: true }).click();
  await sheet
    .getByLabel("Call notes", { exact: true })
    .fill("Called customer about their completed repair.");
  await sheet.getByRole("button", { name: "Log call", exact: true }).click();
  await expect(sheet).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "Amina Browser" }),
  ).toContainText("Sent");
  await showBoardStage(page, "Waiting");
  await card.click();
  await sheet.getByLabel("Reply summary").fill("Everything works well");
  await sheet.getByRole("button", { name: "Log reply", exact: true }).click();
  await expect(sheet).toHaveCount(0);
  await showBoardStage(page, "Replied");
  await card.click();
  await sheet.getByLabel("Closure note").fill("Customer satisfied");
  await sheet
    .getByRole("button", { name: "Close follow-up", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "Amina Browser" }),
  ).toContainText("Closed");
});

test("templates: seeded templates, archive, create, edit, default, filter", async ({
  page,
  operator: _operator,
}) => {
  await page.goto("/templates");
  const first = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: /^Actions for / }) })
    .first();
  await expect(first).toBeVisible();
  const starterCount = await page
    .getByRole("button", { name: /^Actions for / })
    .count();
  await first.getByRole("button", { name: /^Actions for / }).click();
  await page.getByRole("menuitem", { name: "Archive template" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Archive template", exact: true })
    .click();
  await expect(page.getByRole("button", { name: /^Actions for / })).toHaveCount(
    starterCount - 1,
  );
  await page.goto("/templates?createTemplate=true");
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Name", { exact: true }).fill("Browser Check-in");
  await selectOption(page, "Channel", "Phone");
  await sheet
    .getByLabel("Body", { exact: true })
    .fill("Hi {{customer_name}}, how was {{service_name}}?");
  await sheet.getByLabel("Set as default", { exact: true }).check();
  await sheet
    .getByRole("button", { name: "Create template", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  const row = page.getByRole("row").filter({ hasText: "Browser Check-in" });
  await expect(row).toBeVisible();
  await row.getByText("Browser Check-in", { exact: true }).click();
  await expect(sheet.getByLabel("Channel", { exact: true })).toHaveText(
    "Phone",
  );
  await sheet.getByLabel("Name", { exact: true }).fill("Browser Updated");
  await sheet
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(sheet).toHaveCount(0);
  await page.getByPlaceholder(/^Search templates/).fill("Browser Updated");
  await page.getByPlaceholder(/^Search templates/).press("Enter");
  await expect(
    page.getByRole("row").filter({ hasText: "Browser Updated" }),
  ).toBeVisible();
  await page
    .getByRole("row")
    .filter({ hasText: "Browser Updated" })
    .getByText("Browser Updated", { exact: true })
    .click();
  await expect(
    sheet.getByLabel("Set as default", { exact: true }),
  ).toBeChecked();
});

test("workspace settings persist and billing shows free beta limits", async ({
  page,
  operator,
}) => {
  await page.goto("/settings");
  await expect(page.getByLabel("Workspace name", { exact: true })).toHaveValue(
    operator.workspaceName,
  );
  await page
    .getByLabel("Workspace name", { exact: true })
    .fill("Updated Browser Workshop");
  const saved = page.waitForResponse(
    (response) =>
      response.url().includes("workspace.updateSettings") &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Save settings", exact: true })
    .click();
  expect((await saved).ok()).toBe(true);
  await expect(
    page.getByRole("button", { name: "Save settings", exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(page.getByLabel("Workspace name", { exact: true })).toHaveValue(
    "Updated Browser Workshop",
  );
  // A staff user can read plan details even when the optional portal is denied.
  await page.route("**/api/trpc/billing.getPortalUrl?**", (route) =>
    route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify([
        {
          error: {
            json: {
              message: "Owner or admin access is required.",
              code: -32003,
              data: {
                code: "FORBIDDEN",
                httpStatus: 403,
                path: "billing.getPortalUrl",
              },
            },
          },
        },
      ]),
    }),
  );
  await page.goto("/billing");
  await expect(
    page.getByRole("heading", { name: "Billing", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Payments temporarily unavailable" }),
  ).toBeDisabled();
  await expect(page.getByText("Free", { exact: true }).first()).toBeVisible();
});
