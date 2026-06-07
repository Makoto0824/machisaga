"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg" | "full";
  expandable?: boolean;
};

const sizeClass = {
  sm: "w-20 h-20",
  md: "w-28 h-28",
  lg: "w-full max-w-[132px] aspect-[3/4]",
  full: "w-full aspect-[3/4]",
} as const;

const imageClass = "w-full h-full rounded-[10px] object-contain";

export function StoreCharacterImage({
  src,
  alt,
  size = "md",
  expandable = true,
}: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!expandable) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass[size]} shrink-0 rounded-xl object-contain bg-white/60`}
      />
    );
  }

  const buttonSizeClass =
    size === "lg"
      ? `${sizeClass.lg} shrink-0 rounded-xl bg-white/60 p-0.5`
      : `${sizeClass[size]} shrink-0 rounded-xl bg-white/60 p-0.5`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonSizeClass} active:scale-95 transition-transform`}
        aria-label={`${alt}を拡大表示`}
      >
        <img
          src={src}
          alt={alt}
          className={imageClass}
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-6"
          onClick={close}
          role="presentation"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-sm font-bold text-zinc-800"
            aria-label="閉じる"
          >
            閉じる
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] w-auto object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
