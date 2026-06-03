import { BrandLogo } from "@afterservice/ui";
import { appMetadata } from "@afterservice/utils";

export function LandingFooter() {
  return (
    <footer className="relative z-10 border-t border-border bg-background py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <BrandLogo name={appMetadata.name} />
        </div>

        <div className="text-xs text-muted-foreground text-center md:text-left">
          <p>© {new Date().getFullYear()} afterservice. All rights reserved.</p>
          <p className="mt-1">
            Built for local operators in the USA & Canada.
          </p>
        </div>

        <div className="flex gap-6 text-xs text-muted-foreground">
          <a
            href="/privacy"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="mailto:hello@afterservice.app"
            className="hover:text-[#18211c] dark:hover:text-white transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
