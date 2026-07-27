import { afterEach, describe, expect, test } from "bun:test";
import { getQaWorkspaceClassification } from "./qa-maintenance";

const original = process.env.EMAIL_QA_DOMAIN_ROUTES;

afterEach(() => {
  if (original === undefined) process.env.EMAIL_QA_DOMAIN_ROUTES = undefined;
  else process.env.EMAIL_QA_DOMAIN_ROUTES = original;
});

describe("afterservice QA workspace classification", () => {
  test("marks configured owners and leaves ordinary owners normal", () => {
    process.env.EMAIL_QA_DOMAIN_ROUTES = '{"after.test":"tester@example.com"}';
    expect(getQaWorkspaceClassification("owner@after.test")).toMatchObject({
      dataClassification: "qa",
      qaSourceDomain: "after.test",
    });
    expect(getQaWorkspaceClassification("owner@example.com")).toMatchObject({
      dataClassification: "normal",
      qaSourceDomain: null,
    });
  });
});
