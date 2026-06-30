import type { CouponPrize } from "@/data/types";
import { isExpired } from "@/lib/date";
import { getActiveRegion } from "@/lib/region";
import type { UserCoupon } from "@/lib/storage";

/** 同一クーポン（未使用・有効期限内）の最大所持枚数 */
export const MAX_HOLD_PER_COUPON = 1;

/** クーポン一覧などに表示する当たり券か（is_active な景品のみ） */
export function isVisibleCouponId(couponId: string): boolean {
  const prize = getActiveRegion().couponPrizes.find((c) => c.id === couponId);
  if (!prize || prize.is_miss) return false;
  return prize.is_active;
}

export function filterVisibleUserCoupons(coupons: UserCoupon[]): UserCoupon[] {
  return coupons.filter((c) => isVisibleCouponId(c.coupon_id));
}

export function countActiveHoldings(
  coupons: UserCoupon[],
  couponId: string
): number {
  return coupons.filter(
    (c) =>
      c.coupon_id === couponId &&
      !c.used_at &&
      !isExpired(c.expires_at)
  ).length;
}

export function canReceiveCoupon(
  coupons: UserCoupon[],
  couponId: string
): boolean {
  return countActiveHoldings(coupons, couponId) < MAX_HOLD_PER_COUPON;
}

function getActivePrizes(): CouponPrize[] {
  return getActiveRegion().couponPrizes.filter((c) => c.is_active);
}

/** まだ獲得可能な当たり景品 */
export function getDrawableWinPrizes(coupons: UserCoupon[]): CouponPrize[] {
  return getActivePrizes().filter(
    (p) => !p.is_miss && canReceiveCoupon(coupons, p.id)
  );
}

/** 当たりチケットをすべて所持上限まで獲得済みか */
export function isTicketAcquisitionLimitReached(
  coupons: UserCoupon[]
): boolean {
  const winPrizes = getActivePrizes().filter((p) => !p.is_miss);
  if (winPrizes.length === 0) return false;
  return getDrawableWinPrizes(coupons).length === 0;
}

function drawFromPool(prizes: CouponPrize[]): CouponPrize {
  const total = prizes.reduce((sum, p) => sum + p.probability, 0);
  if (total <= 0) {
    return prizes.find((p) => p.is_miss) ?? prizes[0];
  }
  let roll = Math.random() * total;
  for (const prize of prizes) {
    roll -= prize.probability;
    if (roll <= 0) return prize;
  }
  return prizes[prizes.length - 1];
}

/** 所持上限を考慮した抽選（未所持の景品と「はずれ」のみ対象） */
export function drawPrizeForUser(coupons: UserCoupon[]): CouponPrize {
  const all = getActivePrizes();
  const drawable = all.filter(
    (p) => p.is_miss || canReceiveCoupon(coupons, p.id)
  );
  if (drawable.length === 0) {
    return all.find((p) => p.is_miss)!;
  }
  return drawFromPool(drawable);
}
