"use client";

import type { ReactNode } from "react";
import { FunBackground } from "@/components/FunBackground";

type Props = {
  children: ReactNode;
};

export function MobileFrame({ children }: Props) {
  return (
    <div className="app-shell bg-[#ffe8b0] flex justify-center">
      <div className="relative w-full max-w-md h-full fun-page-bg flex flex-col overflow-hidden">
        <FunBackground />
        <div className="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
