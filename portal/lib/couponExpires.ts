import type { CouponPrize } from "@/data/types";

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** fixed_end_date の日付末尾（23:59:59.999） */
export function endOfFixedEndDate(dateStr: string): Date {
  const end = parseDate(dateStr);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** 当選時の expires_at（fixed_end_date 優先、なければ issued + expires_days） */
export function resolveCouponExpiresAt(
  prize: CouponPrize,
  issuedAt: Date
): Date {
  if (prize.fixed_end_date) {
    return endOfFixedEndDate(prize.fixed_end_date);
  }
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + prize.expires_days);
  return expiresAt;
}

/** キャンペーン終了日を過ぎた景品か（抽選対象外判定） */
export function isPrizeDrawPeriodEnded(
  prize: CouponPrize,
  today = new Date()
): boolean {
  if (!prize.fixed_end_date) return false;
  return startOfDay(parseDate(prize.fixed_end_date)) < startOfDay(today);
}
