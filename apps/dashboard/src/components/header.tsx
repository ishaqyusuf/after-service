import { Icons } from "@afterservice/ui/icons";
import { Skeleton } from "@afterservice/ui/skeleton";
import Link from "next/link";
import { Suspense } from "react";
import { HeaderDate } from "@/components/header-date";
import { MobileMenu } from "@/components/mobile-menu";
import { OpenSearchButton } from "@/components/search/open-search-button";
import { UserMenu } from "@/components/user-menu";

function UserMenuSkeleton() {
  return <Skeleton className="h-8 w-8 rounded-full" />;
}

export function Header() {
  return (
    <header
      className="top-0 z-40 flex h-[70px] items-center gap-2 border-b border-[color:var(--wp-line)] bg-[color:var(--wp-ground)] px-2 transition-transform motion-reduce:transition-none sm:gap-3 sm:px-4 md:gap-4 md:px-8"
      style={{
        transform: "translateY(calc(var(--header-offset, 0px) * -1))",
        transitionDuration: "var(--header-transition, 200ms)",
        willChange: "transform",
      }}
    >
      <MobileMenu />

      <Link
        href="/"
        aria-label="afterservice overview"
        className="flex shrink-0 items-center rounded-[10px] md:hidden"
      >
        <Icons.LogoSmall size={28} />
      </Link>

      <HeaderDate />

      <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2 md:ml-4 md:flex-1">
        <OpenSearchButton />

        <div className="ml-auto flex shrink-0 items-center [&>button]:rounded-full [&>button]:p-1.5">
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu isExpanded={false} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
