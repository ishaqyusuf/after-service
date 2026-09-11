import { describe, expect, test } from "bun:test";
import {
  afterserviceQaFormCoverage,
  afterserviceQaFormInventory,
  assertCompleteQaFormCoverage,
  assertQaAcceleratorStartupSafety,
  createQaCustomerFixture,
  getQaAcceleratorAvailability,
  isConfiguredQaDomain,
  QA_ACCELERATOR_CONTRACT_VERSION,
  resolveQaExternalEffectPolicy,
} from "./qa-accelerator";

describe("afterservice QA accelerator capability", () => {
  test("is server-owned, versioned, and unavailable in production", () => {
    expect(
      getQaAcceleratorAvailability({
        clientContractVersion: QA_ACCELERATOR_CONTRACT_VERSION,
        env: {
          AFTERSERVICE_ENV_MODE: "preview",
          EMAIL_QA_DOMAIN_ROUTES: '{"ishaq.qa.test":"ishaq@example.com"}',
          QA_ACCELERATOR_ALLOWED_ORIGINS: "https://preview.afterservice.app",
          QA_ACCELERATOR_ENABLED: "true",
          QA_ACCELERATOR_SECRET:
            "preview-qa-accelerator-secret-with-more-than-32-characters",
        },
        origin: "https://preview.afterservice.app",
        platform: "web",
      }),
    ).toMatchObject({ available: true, environment: "preview" });

    expect(
      getQaAcceleratorAvailability({
        clientContractVersion: QA_ACCELERATOR_CONTRACT_VERSION,
        env: {
          AFTERSERVICE_ENV_MODE: "production",
          EMAIL_QA_DOMAIN_ROUTES: '{"ishaq.qa.test":"ishaq@example.com"}',
          QA_ACCELERATOR_ALLOWED_ORIGINS: "https://preview.afterservice.app",
          QA_ACCELERATOR_ENABLED: "true",
          QA_ACCELERATOR_SECRET:
            "production-must-still-fail-with-a-valid-looking-secret",
        },
        origin: "https://preview.afterservice.app",
        platform: "web",
      }),
    ).toMatchObject({
      available: false,
      category: "environment_not_allowed",
    });
  });

  test("fails closed on version skew, missing secrets, and unconfigured domains", () => {
    expect(
      getQaAcceleratorAvailability({
        clientContractVersion: 99,
        env: {
          AFTERSERVICE_ENV_MODE: "local",
          EMAIL_QA_DOMAIN_ROUTES: '{"ishaq.qa.test":"ishaq@example.com"}',
          QA_ACCELERATOR_ALLOWED_ORIGINS:
            "http://app-afterservice.localhost:1355",
          QA_ACCELERATOR_ENABLED: "true",
          QA_ACCELERATOR_SECRET:
            "local-qa-accelerator-secret-with-more-than-32-characters",
        },
        origin: "http://app-afterservice.localhost:1355",
        platform: "web",
      }),
    ).toMatchObject({ available: false, category: "upgrade_required" });

    expect(
      getQaAcceleratorAvailability({
        clientContractVersion: QA_ACCELERATOR_CONTRACT_VERSION,
        env: {
          AFTERSERVICE_ENV_MODE: "local",
          QA_ACCELERATOR_ENABLED: "true",
        },
        origin: "http://app-afterservice.localhost:1355",
        platform: "web",
      }),
    ).toMatchObject({ available: false, category: "misconfigured" });

    expect(
      isConfiguredQaDomain("ISHAQ.QA.TEST.", {
        EMAIL_QA_DOMAIN_ROUTES: '{"ishaq.qa.test":"ishaq@example.com"}',
      }),
    ).toBe(true);
    expect(
      isConfiguredQaDomain("other.qa.test", {
        EMAIL_QA_DOMAIN_ROUTES: '{"ishaq.qa.test":"ishaq@example.com"}',
      }),
    ).toBe(false);
  });

  test("rejects missing and forged web origins", () => {
    const env = {
      AFTERSERVICE_ENV_MODE: "preview",
      EMAIL_QA_DOMAIN_ROUTES: '{"ishaq.qa.test":"ishaq@example.com"}',
      QA_ACCELERATOR_ALLOWED_ORIGINS: "https://preview.afterservice.app",
      QA_ACCELERATOR_ENABLED: "true",
      QA_ACCELERATOR_SECRET:
        "preview-qa-accelerator-secret-with-more-than-32-characters",
    };

    for (const origin of [undefined, "https://evil.example.com"]) {
      expect(
        getQaAcceleratorAvailability({
          clientContractVersion: QA_ACCELERATOR_CONTRACT_VERSION,
          env,
          origin,
          platform: "web",
        }),
      ).toMatchObject({ available: false, category: "origin_not_allowed" });
    }
  });

  test("refuses production startup before credential access", () => {
    expect(() =>
      assertQaAcceleratorStartupSafety({
        AFTERSERVICE_ENV_MODE: "production",
        QA_ACCELERATOR_ENABLED: "true",
      }),
    ).toThrow("cannot be enabled in production");
  });
});

describe("afterservice QA accelerator safety and fixtures", () => {
  test("allows routed email and blocks unsupported effects for QA workspaces", () => {
    expect(
      resolveQaExternalEffectPolicy({
        effect: "email",
        isQaWorkspace: true,
        isRoutedQaEmail: true,
      }),
    ).toEqual({ allowed: true, reason: "routed_qa_email" });

    for (const effect of [
      "sms",
      "whatsapp",
      "payment",
      "subscription",
      "destructive",
    ] as const) {
      expect(
        resolveQaExternalEffectPolicy({
          effect,
          isQaWorkspace: true,
        }),
      ).toEqual({ allowed: false, reason: "qa_effect_blocked" });
    }
  });

  test("creates deterministic recognizable domain-bound customer drafts", () => {
    const first = createQaCustomerFixture({
      invocation: 1,
      qaDomain: "ishaq.qa.test",
      seed: "test-seed",
    });
    const again = createQaCustomerFixture({
      invocation: 1,
      qaDomain: "ISHAQ.QA.TEST.",
      seed: "test-seed",
    });
    const next = createQaCustomerFixture({
      invocation: 2,
      qaDomain: "ishaq.qa.test",
      seed: "test-seed",
    });

    expect(first).toEqual(again);
    expect(first.email).toEndWith("@ishaq.qa.test");
    expect(first.name).toStartWith("QA Customer ");
    expect(first.phone).toStartWith("+2340000");
    expect(next.email).not.toBe(first.email);
  });

  test("requires exactly one coverage declaration for every owned form", () => {
    expect(() =>
      assertCompleteQaFormCoverage({
        coverage: afterserviceQaFormCoverage,
        formIds: afterserviceQaFormInventory,
      }),
    ).not.toThrow();

    expect(() =>
      assertCompleteQaFormCoverage({
        coverage: afterserviceQaFormCoverage,
        formIds: [...afterserviceQaFormInventory, "customer.untracked"],
      }),
    ).toThrow("Missing: customer.untracked");
  });
});
