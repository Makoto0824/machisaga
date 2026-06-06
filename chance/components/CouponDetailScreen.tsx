"use client";

import { useCallback, useEffect, useState } from "react";
import { CouponTicket } from "@/components/CouponTicket";
import {
  dpBadgeMuted,
  dpBadgeWin,
  dpBtnPrimary,
  dpBtnSecondary,
  dpCard,
  dpSubtitle,
} from "@/components/ui/theme";
import { formatDate, isExpired } from "@/lib/date";
import {
  fetchUserCouponById,
  useCoupon,
  type UserCoupon,
} from "@/lib/chance";
import { getTicketImageByCouponId } from "@/lib/tickets";

type Props = {
  couponId: string;
  onBack: () => void;
};

const NOTICE =
  "この画面をスタッフに提示してください。内容確認後、スタッフの前で『使用する』ボタンを押してください。";

export function CouponDetailScreen({ couponId, onBack }: Props) {
  const [coupon, setCoupon] = useState<UserCoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchUserCouponById(couponId);
    setCoupon(data);
    setLoading(false);
  }, [couponId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUse = async () => {
    if (!coupon || using) return;
    setUsing(true);
    setMessage(null);
    const outcome = await useCoupon(coupon.id);
    setUsing(false);

    if (!outcome.ok) {
      if (outcome.reason === "used") setMessage("すでに使用済みです");
      else if (outcome.reason === "expired") setMessage("有効期限が切れています");
      else setMessage("クーポンが見つかりません");
      return;
    }

    setCoupon(outcome.coupon);
    setMessage("使用しました");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-zinc-500">読み込み中...</p>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <p className="text-sm text-zinc-800 mb-4">
          クーポンが見つかりません
        </p>
        <button type="button" onClick={onBack} className={dpBtnSecondary}>
          戻る
        </button>
      </div>
    );
  }

  const used = Boolean(coupon.used_at);
  const expired = isExpired(coupon.expires_at);
  const canUse = !used && !expired;
  const ticketSrc = getTicketImageByCouponId(coupon.coupon_id);

  let statusLabel = "未使用";
  let statusClass = dpBadgeWin;
  if (used) {
    statusLabel = "使用済み";
    statusClass = dpBadgeMuted;
  } else if (expired) {
    statusLabel = "期限切れ";
    statusClass = dpBadgeMuted;
  }

  return (
    <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto">
      <button
        type="button"
        onClick={onBack}
        className="pt-4 text-sm font-bold text-zinc-600"
      >
        ← 戻る
      </button>

      <div className="pt-2 pb-3 flex items-center justify-between gap-2">
        <span className={statusClass}>{statusLabel}</span>
        <p className="text-xs text-zinc-500">
          有効期限：{formatDate(coupon.expires_at)}
        </p>
      </div>

      {ticketSrc ? (
        <CouponTicket
          src={ticketSrc}
          alt={`${coupon.store_name} ${coupon.title}`}
          dimmed={!canUse}
          className="mb-4"
        />
      ) : (
        <header className="pb-4 border-b-2 border-[#e0dbd0] mb-4">
          <h1 className="text-lg font-bold text-zinc-900">
            {coupon.title}
          </h1>
          <p className={`${dpSubtitle} mt-1`}>{coupon.store_name}</p>
        </header>
      )}

      <dl className="space-y-3 text-sm">
        <Section label="特典内容" value={coupon.description} />
        <Section label="利用条件" value={coupon.usage_condition} />
        {used && coupon.used_at && (
          <Section label="使用日時" value={formatDate(coupon.used_at)} />
        )}
      </dl>

      <div className={`mt-4 p-3 ${dpCard}`}>
        <p className="text-xs text-zinc-900 leading-relaxed font-medium">
          {NOTICE}
        </p>
      </div>

      {message && (
        <p className="mt-3 text-center text-sm font-bold text-red-700">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleUse}
        disabled={!canUse || using}
        className={`${dpBtnPrimary} mt-6`}
      >
        {using ? "処理中..." : "使用する"}
      </button>
    </div>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold tracking-wider uppercase text-zinc-500">
        {label}
      </dt>
      <dd className="text-zinc-800 mt-1 leading-relaxed">{value}</dd>
    </div>
  );
}
