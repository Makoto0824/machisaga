"use client";

export function FunBackground() {
  return (
    <div
      className="fun-bg-layer pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="fun-blob fun-blob-1" />
      <div className="fun-blob fun-blob-2" />
      <div className="fun-blob fun-blob-3" />
      <div className="fun-blob fun-blob-4" />
      <div className="fun-blob fun-blob-5" />
    </div>
  );
}
