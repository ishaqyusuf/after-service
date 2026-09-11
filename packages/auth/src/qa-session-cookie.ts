import { createHmac } from "node:crypto";

type CookieEnvironment = Record<string, string | undefined>;

function getAuthSecret(env: CookieEnvironment) {
  const configured =
    env.BETTER_AUTH_SECRET?.trim() ?? env.AUTH_SECRET?.trim() ?? "";
  if (configured) return configured;
  if (env.NODE_ENV === "production") {
    throw new Error("BETTER_AUTH_SECRET is required in production.");
  }
  return "afterservice-local-development-secret";
}

function getAuthBaseUrl(env: CookieEnvironment) {
  return (
    env.BETTER_AUTH_URL?.trim() ??
    env.NEXT_PUBLIC_DASHBOARD_URL?.trim() ??
    "http://localhost:4101"
  );
}

function getCookieNames(env: CookieEnvironment) {
  const prefix = getAuthBaseUrl(env).startsWith("https://") ? "__Secure-" : "";
  return {
    sessionData: `${prefix}better-auth.session_data`,
    sessionToken: `${prefix}better-auth.session_token`,
  };
}

function serializeCookie(
  name: string,
  value: string,
  input: { expires?: Date; maxAge: number },
) {
  return [
    `${name}=${value}`,
    `Max-Age=${Math.max(0, Math.floor(input.maxAge))}`,
    "Path=/",
    input.expires ? `Expires=${input.expires.toUTCString()}` : null,
    "HttpOnly",
    name.startsWith("__Secure-") ? "Secure" : null,
    "SameSite=Lax",
  ]
    .filter(Boolean)
    .join("; ");
}

function signCookieValue(value: string, secret: string) {
  const signature = createHmac("sha256", secret).update(value).digest("base64");
  return encodeURIComponent(`${value}.${signature}`);
}

export function createBetterAuthSessionCookieHeaders(
  input: { expiresAt: Date; token: string },
  env: CookieEnvironment = process.env,
) {
  const names = getCookieNames(env);
  const maxAge = Math.max(
    0,
    Math.floor((input.expiresAt.getTime() - Date.now()) / 1000),
  );
  return [
    serializeCookie(
      names.sessionToken,
      signCookieValue(input.token, getAuthSecret(env)),
      { expires: input.expiresAt, maxAge },
    ),
    serializeCookie(names.sessionData, "", { maxAge: 0 }),
  ];
}

export function clearBetterAuthSessionCookieHeaders(
  env: CookieEnvironment = process.env,
) {
  const names = getCookieNames(env);
  return [
    serializeCookie(names.sessionToken, "", { maxAge: 0 }),
    serializeCookie(names.sessionData, "", { maxAge: 0 }),
  ];
}
