import { describe, expect, test } from "bun:test";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { applyQuickFill } from "./quick-fill";

function draft() {
  const values: Record<string, unknown> = {};
  const setValue: UseFormReturn<FieldValues>["setValue"] = (name, value) => {
    values[name] = value;
  };
  return { form: { setValue }, values };
}
const context = {
  seed: "preview-contract",
  invocation: 1,
  qaDomain: "preview.qa.test",
};

describe("Quick Fill form contracts", () => {
  test("job calendar controls receive Date objects and an existing customer", () => {
    const { form, values } = draft();
    applyQuickFill(
      form,
      { name: "job", customers: [{ id: "customer-1" }] },
      context,
    );
    expect(values.completedAt).toBeInstanceOf(Date);
    expect(values.nextFollowUpAt).toBeInstanceOf(Date);
    expect(values.customerId).toBe("customer-1");
    expect(values.title).toBeString();
  });
  test("follow-up job and customer prerequisites remain consistent", () => {
    const { form, values } = draft();
    applyQuickFill(
      form,
      {
        name: "followUp",
        customers: [{ id: "customer-1" }],
        jobs: [
          { id: "job-1", customerId: "customer-1" },
          { id: "foreign-job", customerId: "other-customer" },
        ],
      },
      context,
    );
    expect(values.customerId).toBe("customer-1");
    expect(values.jobId).toBe("job-1");
    expect(values.dueAt).toBeInstanceOf(Date);
  });
  test("customer drafts are deterministic and domain-bound", () => {
    const one = draft();
    const two = draft();
    applyQuickFill(one.form, { name: "customer" }, context);
    applyQuickFill(two.form, { name: "customer" }, context);
    expect(one.values).toEqual(two.values);
    expect(one.values.email).toEndWith("@preview.qa.test");
  });
  test("signup identity never fills a password", () => {
    const { form, values } = draft();
    applyQuickFill(form, { name: "signUpIdentity" }, context);
    expect(values.email).toEndWith("@preview.qa.test");
    expect(values.password).toBeUndefined();
  });
});
