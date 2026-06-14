import type { CouponPrize } from "@/data/types";
import {
  drawPrizeForUser,
  isTicketAcquisitionLimitReached,
} from "@/lib/couponLimits";
import { DAILY_LIMIT, getTodayRange } from "@/lib/date";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  addLocalChanceLog,
  addLocalUserCoupon,
  clearLocalChanceLogs,
  clearLocalUserCoupons,
  createUserCouponFromPrize,
  getLocalChanceLogs,
  getLocalUserCoupons,
  updateLocalUserCoupon,
  type ChanceLog,
  type UserCoupon,
} from "@/lib/storage";
import { createId } from "@/lib/id";
import { isTestToolsEnabled } from "@/lib/testMode";
import { resolveUserId } from "@/lib/user";

export type ChanceResult = {
  prize: CouponPrize;
  resultType: "win" | "lose";
  remaining: number;
};

export type PlayBlockReason = "daily_limit" | "ticket_limit";

export type PlayChanceOutcome =
  | { ok: true; result: ChanceResult }
  | { ok: false; reason: PlayBlockReason };

async function countTodayPlaysSupabase(userId: string): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;
  const { start, end } = getTodayRange();
  const { count, error } = await supabase
    .from("chance_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("played_at", start.toISOString())
    .lte("played_at", end.toISOString());
  if (error) {
    console.error("countTodayPlaysSupabase", error);
    return 0;
  }
  return count ?? 0;
}

function countTodayPlaysLocal(userId: string): number {
  const { start, end } = getTodayRange();
  return getLocalChanceLogs(userId).filter((log) => {
    const played = new Date(log.played_at);
    return played >= start && played <= end;
  }).length;
}

export async function getRemainingPlays(): Promise<number> {
  const userId = await resolveUserId();
  const count = isSupabaseConfigured()
    ? await countTodayPlaysSupabase(userId)
    : countTodayPlaysLocal(userId);
  return Math.max(0, DAILY_LIMIT - count);
}

export async function getPlayBlockReason(): Promise<PlayBlockReason | null> {
  const heldCoupons = await fetchUserCoupons();
  if (isTicketAcquisitionLimitReached(heldCoupons)) {
    return "ticket_limit";
  }

  const remaining = await getRemainingPlays();
  if (remaining <= 0) return "daily_limit";

  return null;
}

export async function playChance(): Promise<PlayChanceOutcome> {
  const userId = await resolveUserId();

  const heldCoupons = await fetchUserCoupons();
  if (isTicketAcquisitionLimitReached(heldCoupons)) {
    return { ok: false, reason: "ticket_limit" };
  }

  const remaining = await getRemainingPlays();
  if (remaining <= 0) {
    return { ok: false, reason: "daily_limit" };
  }
  const prize = drawPrizeForUser(heldCoupons);
  const resultType: "win" | "lose" = prize.is_miss ? "lose" : "win";
  const playedAt = new Date();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const { error: logError } = await supabase.from("chance_logs").insert({
      user_id: userId,
      coupon_id: prize.is_miss ? null : prize.id,
      result_type: resultType,
      played_at: playedAt.toISOString(),
    });
    if (logError) console.error("chance_logs insert", logError);

    if (resultType === "win") {
      const expiresAt = new Date(playedAt);
      expiresAt.setDate(expiresAt.getDate() + prize.expires_days);
      const { error: couponError } = await supabase.from("user_coupons").insert({
        user_id: userId,
        coupon_id: prize.id,
        store_name: prize.store_name,
        title: prize.title,
        description: prize.description,
        usage_condition: prize.usage_condition,
        issued_at: playedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        used_at: null,
      });
      if (couponError) console.error("user_coupons insert", couponError);
    }
  } else {
    const log: ChanceLog = {
      id: createId(),
      user_id: userId,
      coupon_id: prize.is_miss ? null : prize.id,
      result_type: resultType,
      played_at: playedAt.toISOString(),
    };
    addLocalChanceLog(log);
    if (resultType === "win") {
      addLocalUserCoupon(createUserCouponFromPrize(userId, prize, playedAt));
    }
  }

  return {
    ok: true,
    result: {
      prize,
      resultType,
      remaining: remaining - 1,
    },
  };
}

export async function fetchUserCoupons(): Promise<UserCoupon[]> {
  const userId = await resolveUserId();
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const { data, error } = await supabase
      .from("user_coupons")
      .select("*")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });
    if (error) {
      console.error("fetchUserCoupons", error);
      return [];
    }
    return (data ?? []) as UserCoupon[];
  }
  return getLocalUserCoupons(userId).sort(
    (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()
  );
}

export async function fetchUserCouponById(id: string): Promise<UserCoupon | null> {
  const coupons = await fetchUserCoupons();
  return coupons.find((c) => c.id === id) ?? null;
}

export type UseCouponOutcome =
  | { ok: true; coupon: UserCoupon }
  | { ok: false; reason: "not_found" | "used" | "expired" };

export async function useCoupon(id: string): Promise<UseCouponOutcome> {
  const coupon = await fetchUserCouponById(id);
  if (!coupon) return { ok: false, reason: "not_found" };
  if (coupon.used_at) return { ok: false, reason: "used" };
  if (new Date(coupon.expires_at) < new Date()) {
    return { ok: false, reason: "expired" };
  }

  const usedAt = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const { error } = await supabase
      .from("user_coupons")
      .update({ used_at: usedAt })
      .eq("id", id);
    if (error) {
      console.error("useCoupon", error);
      return { ok: false, reason: "not_found" };
    }
    return { ok: true, coupon: { ...coupon, used_at: usedAt } };
  }

  const updated = updateLocalUserCoupon(id, { used_at: usedAt });
  if (!updated) return { ok: false, reason: "not_found" };
  return { ok: true, coupon: updated };
}

/** テスト用：所持クーポンと本日の挑戦履歴をリセット */
export async function resetUserCoupons(): Promise<boolean> {
  if (!isTestToolsEnabled()) return false;

  const userId = await resolveUserId();

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const { error: couponError } = await supabase
      .from("user_coupons")
      .delete()
      .eq("user_id", userId);
    if (couponError) {
      console.error("resetUserCoupons", couponError);
      return false;
    }
    const { error: logError } = await supabase
      .from("chance_logs")
      .delete()
      .eq("user_id", userId);
    if (logError) {
      console.error("resetChanceLogs", logError);
      return false;
    }
    return true;
  }

  clearLocalUserCoupons(userId);
  clearLocalChanceLogs(userId);
  return true;
}

export type { UserCoupon };
