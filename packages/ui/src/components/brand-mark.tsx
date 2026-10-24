import type { SVGProps } from "react";
import { brandColors, brandMarkDot, brandMarkPaths } from "../brand";

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {brandMarkPaths.map((path) => (
        <path
          key={path}
          d={path}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="7"
        />
      ))}
      <circle {...brandMarkDot} fill={brandColors.accent} />
    </svg>
  );
}
