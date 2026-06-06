import { getActiveRegion } from "@/lib/region";

export function getTicketImageByCouponId(couponId: string): string | null {
  const region = getActiveRegion();
  const prize = region.couponPrizes.find((c) => c.id === couponId);
  if (!prize?.store_id) return null;
  return region.ticketImages[prize.store_id] ?? null;
}
