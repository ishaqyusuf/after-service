import { type NextRequest, NextResponse } from "next/server";
import {
  appendAuthCookieExpiryFallbacks,
  hasAcceptedSessionCookie,
} from "@/lib/session-cookies";

const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/onboarding",
  "/api/",
  "/_next/",
  "/favicon",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPath(pathname: string): boolean {
  return pathname === "/sign-in" || pathname === "/sign-up";
}

function isLogoutPath(pathname: string): boolean {
  return pathname === "/logout" || pathname === "/sign-out";
}

function isLogoutRequest(request: NextRequest): boolean {
  return (
    isLogoutPath(request.nextUrl.pathname) ||
    request.nextUrl.searchParams.get("logout") === "true"
  );
}

function getSafeReturnTo(request: NextRequest): string | null {
  const returnTo = request.nextUrl.searchParams.get("return_to");
  if (!returnTo?.startsWith("/")) return null;
  return returnTo;
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
  const { pathname, search } = request.nextUrl;
  const authenticated = hasAcceptedSessionCookie(request);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-pathname", pathname);

  if (authenticated) {
    if (isLogoutRequest(request)) {
      return redirectToSignInAfterLogout(request);
    }

    if (isAuthPath(pathname)) {
      const returnTo = getSafeReturnTo(request);
      return NextResponse.redirect(new URL(returnTo ?? "/", request.url));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isLogoutRequest(request)) {
    return redirectToSignInAfterLogout(request);
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("return_to", `${pathname}${search}`);

  return NextResponse.redirect(signInUrl);
}
