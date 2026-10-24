import type { ReactNode } from "react";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-[min(calc(100%-40px),760px)] py-16 md:py-24">
      <p className="text-sm font-semibold text-muted-foreground">Legal</p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Effective 24 October 2026
      </p>
      <div className="mt-8 space-y-8 text-base leading-7 text-muted-foreground [&_a]:break-words [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:pl-1 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
      <nav
        aria-label="Legal and support"
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:underline [&_a]:underline-offset-4"
      >
        <a href="/privacy">Privacy policy</a>
        <a href="/terms">Terms of service</a>
        <a href="mailto:hello@afterservice.app">Contact support</a>
      </nav>
    </main>
  );
}
