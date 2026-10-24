import localFont from "next/font/local";
import { cn } from "../utils/cn";
import { BrandMark } from "./brand-mark";

const brandSans = localFont({
  src: "../fonts/inter-regular.ttf",
  display: "swap",
  preload: false,
});

export function BrandLogo({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 whitespace-nowrap text-foreground leading-none",
        className,
      )}
    >
      <BrandMark className="size-8 shrink-0" />
      <span
        className="text-lg font-semibold tracking-[-0.02em]"
        style={{ fontFamily: brandSans.style.fontFamily }}
      >
        {name}
      </span>
    </div>
  );
}
