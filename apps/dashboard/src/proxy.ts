import { type NextRequest, NextResponse } from "next/server";

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

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const normalizedName = cookie.name
      .replace(/^__Secure-/, "")
      .replace(/^__Host-/, "");

    return (
      normalizedName === "better-auth.session_token" ||
      normalizedName === "better-auth-session_token" ||
      normalizedName === "afterservice.session_token"
    );
  });
}

function getSafeReturnTo(request: NextRequest): string | null {
  const returnTo = request.nextUrl.searchParams.get("return_to");
  if (!returnTo?.startsWith("/")) return null;
  return returnTo;
}

export const config = {
  matcher: ["/((?!api/|trpc/|_next/|__nextjs|_vercel|[\\w-]+\\.\\w+).*)"],
};

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = hasSessionCookie(request);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-pathname", pathname);

  if (authenticated) {
    if (isAuthPath(pathname)) {
      const returnTo = getSafeReturnTo(request);
      return NextResponse.redirect(new URL(returnTo ?? "/", request.url));
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("return_to", `${pathname}${search}`);

  return NextResponse.redirect(signInUrl);
}
