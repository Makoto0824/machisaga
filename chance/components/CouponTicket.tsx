"use client";

type Props = {
  src: string;
  alt: string;
  dimmed?: boolean;
  className?: string;
  priority?: boolean;
};

export function CouponTicket({
  src,
  alt,
  dimmed = false,
  className = "",
  priority = false,
}: Props) {
  return (
    <div className={`relative ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`w-full h-auto rounded-xl dp-chunky-border-sm ${
          dimmed ? "opacity-45 grayscale" : ""
        }`}
      />
      {dimmed && (
        <div className="absolute inset-0 rounded-xl bg-black/30 pointer-events-none" />
      )}
    </div>
  );
}
