"use client";

import type { ReactNode } from "react";
import { FunBackground } from "@/components/FunBackground";

type Props = {
  children: ReactNode;
};

export function MobileFrame({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#ffe8b0] flex justify-center">
      <div className="relative w-full max-w-md min-h-screen fun-page-bg flex flex-col">
        <FunBackground />
        <div className="relative z-10 flex flex-col flex-1 h-dvh min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
