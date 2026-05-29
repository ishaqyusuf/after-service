import { type NextRequest, NextResponse } from "next/server";

const authRoutes = new Set(["/sign-in", "/sign-up"]);

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api and /trpc routes
     * 2. /_next internals
     * 3. Vercel/Next dev internals
     * 4. root public files such as /favicon.ico and /icon.svg
     */
    "/((?!api/|trpc/|_next/|__nextjs|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function proxy(request: NextRequest) {
  const authenticated = await hasSession(request);
  const { pathname, search } = request.nextUrl;
  const isAuthRoute = authRoutes.has(pathname);

  if (authenticated) {
    if (isAuthRoute) {
      const returnTo = getSafeReturnTo(request);

      return NextResponse.redirect(new URL(returnTo ?? "/", request.url));
    }

    return NextResponse.next();
  }

  if (isAuthRoute) {
    return NextResponse.next();
  }

  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("return_to", `${pathname}${search}`);

  return NextResponse.redirect(signInUrl);
}

async function hasSession(request: NextRequest) {
  try {
    const response = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        cache: "no-store",
        headers: request.headers,
        method: "GET",
      },
    );

    if (!response.ok) {
      return false;
    }

    const session = (await response.json().catch(() => null)) as {
      user?: unknown;
    } | null;

    return Boolean(session?.user);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[proxy] failed to resolve auth session", error);
    }
  }

  return false;
}

function getSafeReturnTo(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return_to");

  if (!returnTo?.startsWith("/")) {
    return null;
  }

  return returnTo;
}
