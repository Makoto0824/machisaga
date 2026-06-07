import type { RegionConfig } from "@/data/types";
import { getActiveRegion } from "@/lib/region";

export function getTicketImageByCouponId(couponId: string): string | null {
  const region = getActiveRegion();
  const prize = region.couponPrizes.find((c) => c.id === couponId);
  if (!prize?.store_id) return null;
  return region.ticketImages[prize.store_id] ?? null;
}

export function getRegionTicketUrls(region: RegionConfig): string[] {
  return Object.values(region.ticketImages);
}

export function preloadTicketImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    const done = () => resolve();
    img.onload = () => {
      void img.decode().finally(done);
    };
    img.onerror = done;
    img.src = src;
  });
}

export function preloadRegionTickets(region: RegionConfig): Promise<void[]> {
  return Promise.all(getRegionTicketUrls(region).map(preloadTicketImage));
}
