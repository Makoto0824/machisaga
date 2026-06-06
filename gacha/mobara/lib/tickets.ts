import { COUPON_PRIZES } from "@/data/mockData";
import { publicPath } from "@/lib/paths";

const TICKET_IMAGES: Record<string, string> = {
  "store-kurofune": publicPath("/assets/images/tickets/kurofune1.png"),
  "store-laughin": publicPath("/assets/images/tickets/laughin.png"),
  "store-reve": publicPath("/assets/images/tickets/reve.png"),
};

export function getTicketImageByCouponId(couponId: string): string | null {
  const prize = COUPON_PRIZES.find((c) => c.id === couponId);
  if (!prize?.store_id) return null;
  return TICKET_IMAGES[prize.store_id] ?? null;
}
