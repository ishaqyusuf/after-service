import { expect, test } from "bun:test";
import { NextRequest } from "next/server";
import proxy from "./proxy";

test("Portless signup preserves the external HTTPS host instead of the internal Next.js listener", async () => {
  const request = new NextRequest(
    "http://localhost:4100/signup?return_to=%2Fcustomers",
    {
      headers: { host: "afterservice.localhost", "x-forwarded-proto": "https" },
    },
  );
  const response = await proxy(request);
  expect(response.headers.get("location")).toBe(
    "https://app-afterservice.localhost/sign-up?return_to=%2Fcustomers",
  );
});
