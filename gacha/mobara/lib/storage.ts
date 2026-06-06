import type { CouponPrize } from "@/data/mockData";
import { createId } from "@/lib/id";

export type GachaLog = {
  id: string;
  user_id: string;
  coupon_id: string | null;
  result_type: "win" | "lose";
  played_at: string;
};

export type UserCoupon = {
  id: string;
  user_id: string;
  coupon_id: string;
  store_name: string;
  title: string;
  description: string;
  usage_condition: string;
  issued_at: string;
  expires_at: string;
  used_at: string | null;
};

const GACHA_LOGS_KEY = "machisaga_gacha_logs";
const USER_COUPONS_KEY = "machisaga_user_coupons_v2";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalGachaLogs(userId: string): GachaLog[] {
  const all = readJson<GachaLog[]>(GACHA_LOGS_KEY, []);
  return all.filter((l) => l.user_id === userId);
}

export function addLocalGachaLog(log: GachaLog): void {
  const all = readJson<GachaLog[]>(GACHA_LOGS_KEY, []);
  all.push(log);
  writeJson(GACHA_LOGS_KEY, all);
}

export function getLocalUserCoupons(userId: string): UserCoupon[] {
  const all = readJson<UserCoupon[]>(USER_COUPONS_KEY, []);
  return all.filter((c) => c.user_id === userId);
}

export function addLocalUserCoupon(coupon: UserCoupon): void {
  const all = readJson<UserCoupon[]>(USER_COUPONS_KEY, []);
  all.push(coupon);
  writeJson(USER_COUPONS_KEY, all);
}

export function clearLocalUserCoupons(userId: string): void {
  const all = readJson<UserCoupon[]>(USER_COUPONS_KEY, []);
  writeJson(
    USER_COUPONS_KEY,
    all.filter((c) => c.user_id !== userId)
  );
}

export function updateLocalUserCoupon(
  id: string,
  updates: Partial<UserCoupon>
): UserCoupon | null {
  const all = readJson<UserCoupon[]>(USER_COUPONS_KEY, []);
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return null;
  all[index] = { ...all[index], ...updates };
  writeJson(USER_COUPONS_KEY, all);
  return all[index];
}

export function createUserCouponFromPrize(
  userId: string,
  prize: CouponPrize,
  issuedAt: Date
): UserCoupon {
  const expiresAt = new Date(issuedAt);
  expiresAt.setDate(expiresAt.getDate() + prize.expires_days);
  return {
    id: createId(),
    user_id: userId,
    coupon_id: prize.id,
    store_name: prize.store_name,
    title: prize.title,
    description: prize.description,
    usage_condition: prize.usage_condition,
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    used_at: null,
  };
}
