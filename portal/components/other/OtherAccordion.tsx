"use client";

import { dpCardLight } from "@/components/ui/theme";

type Props = {
  title: string;
  id?: string;
  children: React.ReactNode;
};

export function OtherAccordion({ title, id, children }: Props) {
  return (
    <details id={id} className={`${dpCardLight} group mt-3`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-sm font-bold text-zinc-800 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span
          className="text-zinc-400 text-xs transition-transform group-open:rotate-180"
          aria-hidden
        >
          ▼
        </span>
      </summary>
      <div className="border-t border-zinc-100 px-4 pb-4 pt-3">{children}</div>
    </details>
  );
}
