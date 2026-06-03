"use client";

import { BrandLogo } from "@afterservice/ui";
import Link from "next/link";
import { useState } from "react";
import { MainMenu } from "./main-menu";
import { UserMenu } from "./user-menu";

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`h-screen flex-shrink-0 flex-col justify-between fixed top-0 pb-4 items-center hidden md:flex z-50 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] bg-background border-r border-border ${
        isExpanded ? "w-[240px]" : "w-[70px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`absolute top-0 left-0 h-[70px] flex items-center bg-background border-b border-border transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isExpanded ? "w-full justify-start pl-6" : "w-[69px] justify-center"
        }`}
      >
        <Link href="/" className="transition-none flex items-center">
          {/* Use standard BrandLogo if it's responsive, or pass isExpanded if supported */}
          <span className="font-bold text-xl">{isExpanded ? "Afterservice" : "AS"}</span>
        </Link>
      </div>

      <div className="flex flex-col w-full pt-[70px] flex-1 mb-3">
        <MainMenu isExpanded={isExpanded} />
      </div>

      <div className="flex w-full mt-auto mb-2 px-2">
        <UserMenu isExpanded={isExpanded} />
      </div>
    </aside>
  );
}
