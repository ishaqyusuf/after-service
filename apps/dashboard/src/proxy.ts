import { type NextRequest, NextResponse } from "next/server";
import { createI18nMiddleware } from "next-international/middleware";
import {
  appendAuthCookieExpiryFallbacks,
  hasAcceptedSessionCookie,
} from "@/lib/session-cookies";

const I18nMiddleware = createI18nMiddleware({
  locales: ["en"],
  defaultLocale: "en",
  urlMappingStrategy: "rewrite",
});

const LOCALES = new Set(["en"]);

function stripSupportedLocale(pathname: string) {
  const pathnameLocale = pathname.split("/", 2)?.[1];

  if (!pathnameLocale || !LOCALES.has(pathnameLocale)) {
    return pathname || "/";
  }

  const pathnameWithoutLocale = pathname.slice(pathnameLocale.length + 1);

  return pathnameWithoutLocale || "/";
}

const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/api/",
  "/_next/",
  "/favicon",
  "/sentry-example-page",
];

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isLogoutPath(pathname: string): boolean {
  return pathname === "/logout" || pathname === "/sign-out";
}

function isLogoutRequest(request: NextRequest): boolean {
  const pathnameWithoutLocale = stripSupportedLocale(request.nextUrl.pathname);

  return (
    isLogoutPath(pathnameWithoutLocale || "/") ||
    request.nextUrl.searchParams.get("logout") === "true"
  );
}

function redirectToSignInAfterLogout(request: NextRequest): NextResponse {
  return appendAuthCookieExpiryFallbacks(
    NextResponse.redirect(new URL("/sign-in", request.url)),
  );
}

export const config = {
  matcher: ["/((?!api/|trpc/|_next/|__nextjs|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function proxy(request: NextRequest) {
  const response = I18nMiddleware(request);
  const { search } = request.nextUrl;
  const authenticated = hasAcceptedSessionCookie(request);
  const normalizedPathname = stripSupportedLocale(request.nextUrl.pathname);

  if (authenticated) {
    if (isLogoutRequest(request)) {
      return redirectToSignInAfterLogout(request);
    }

    return response;
  }

  if (isPublicPath(normalizedPathname)) {
    return response;
  }

  if (isLogoutRequest(request)) {
    return redirectToSignInAfterLogout(request);
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("return_to", `${normalizedPathname}${search}`);

  return NextResponse.redirect(signInUrl);
}
