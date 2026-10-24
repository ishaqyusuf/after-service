import { expect, spyOn, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { auth, getAuthBaseUrl } from "../../packages/auth/src/index";
import { localTestDb } from "../support/local-db";

const db = localTestDb();
const origin = getAuthBaseUrl() ?? "http://localhost:4101";

function post(path: string, body: Record<string, unknown>) {
  return auth.handler(
    new Request(`${origin}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", origin },
      body: JSON.stringify(body),
    }),
  );
}

test("recovery email callback resets once, expires, revokes sessions, and permits the new password", async () => {
  const marker = `password-recovery-${randomUUID()}`;
  const email = `${marker}@afterservice.invalid`;
  const oldPassword = `old-${randomUUID()}`;
  const newPassword = `new-${randomUUID()}`;
  const original = {
    EMAIL_DELIVERY_MODE: process.env.EMAIL_DELIVERY_MODE,
    EMAIL_QA_DOMAIN_ROUTES: process.env.EMAIL_QA_DOMAIN_ROUTES,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  };
  process.env.EMAIL_DELIVERY_MODE = "live";
  process.env.EMAIL_QA_DOMAIN_ROUTES = "{}";
  process.env.RESEND_API_KEY = "synthetic-integration-provider-key";
  let emailLink = "";
  let sendCount = 0;
  const provider = spyOn(globalThis, "fetch").mockImplementation(
    Object.assign(
      async (
        input: Parameters<typeof fetch>[0],
        init?: Parameters<typeof fetch>[1],
      ) => {
        if (String(input) !== "https://api.resend.com/emails")
          throw new Error("Unexpected integration network request.");
        const payload = JSON.parse(String(init?.body));
        emailLink =
          String(payload.html)
            .match(/href="([^"]+)"/)?.[1]
            ?.replaceAll("&amp;", "&") ?? "";
        sendCount += 1;
        return Response.json({ id: "synthetic-message" });
      },
      { preconnect: fetch.preconnect },
    ),
  );
  let userId: string | undefined;
  try {
    const signup = await post("sign-up/email", {
      name: marker,
      email,
      password: oldPassword,
    });
    expect(signup.status).toBe(200);
    userId = (await db.user.findUniqueOrThrow({ where: { email } })).id;
    expect(await db.session.count({ where: { userId } })).toBeGreaterThan(0);

    const requested = await post("request-password-reset", {
      email,
      redirectTo: `${origin}/reset-password`,
    });
    expect(requested.status).toBe(200);
    const generic = await requested.json();
    expect(sendCount).toBe(1);
    const callback = await auth.handler(new Request(emailLink));
    expect(callback.status).toBe(302);
    const target = new URL(
      callback.headers.get("location") ?? "https://invalid.test",
    );
    expect(target.origin).toBe(new URL(origin).origin);
    expect(target.pathname).toBe("/reset-password");
    const token = target.searchParams.get("token");
    expect(Boolean(token)).toBe(true);

    expect((await post("reset-password", { newPassword })).status).toBe(400);
    expect(
      (await post("reset-password", { newPassword: "short", token })).status,
    ).toBe(400);
    expect((await post("reset-password", { newPassword, token })).status).toBe(
      200,
    );
    expect(await db.session.count({ where: { userId } })).toBe(0);
    expect(
      (await post("reset-password", { newPassword: oldPassword, token }))
        .status,
    ).toBe(400);
    const reused = await auth.handler(new Request(emailLink));
    expect(
      new URL(
        reused.headers.get("location") ?? "https://invalid.test",
      ).searchParams.get("error"),
    ).toBe("INVALID_TOKEN");
    expect(
      (await post("sign-in/email", { email, password: oldPassword })).status,
    ).toBe(401);
    expect(
      (await post("sign-in/email", { email, password: newPassword })).status,
    ).toBe(200);

    await post("request-password-reset", {
      email,
      redirectTo: `${origin}/reset-password`,
    });
    const expiredToken = new URL(emailLink).pathname.split("/").at(-1);
    await db.verification.updateMany({
      where: { value: userId, identifier: `reset-password:${expiredToken}` },
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });
    expect(
      (
        await post("reset-password", {
          newPassword: oldPassword,
          token: expiredToken,
        })
      ).status,
    ).toBe(400);
    const expired = await auth.handler(new Request(emailLink));
    expect(
      new URL(
        expired.headers.get("location") ?? "https://invalid.test",
      ).searchParams.get("error"),
    ).toBe("INVALID_TOKEN");

    const absent = await post("request-password-reset", {
      email: `absent-${email}`,
      redirectTo: `${origin}/reset-password`,
    });
    expect(absent.status).toBe(200);
    expect(await absent.json()).toEqual(generic);
    expect(sendCount).toBe(2);
    expect(
      (
        await post("request-password-reset", {
          email,
          redirectTo: "https://untrusted.invalid/reset-password",
        })
      ).status,
    ).toBe(403);
  } finally {
    provider.mockRestore();
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    if (userId) {
      await db.verification.deleteMany({ where: { value: userId } });
      await db.user.delete({ where: { id: userId } });
    }
  }
});
