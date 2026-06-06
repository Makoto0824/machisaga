"use client";

import { useCallback, useEffect, useState } from "react";
import { CouponTicket } from "@/components/CouponTicket";
import {
  dpBadgeMuted,
  dpBadgeWin,
  dpBtnGhost,
  dpCardLight,
  dpLabel,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";
import { formatDate, isExpired } from "@/lib/date";
import { fetchUserCoupons, type UserCoupon } from "@/lib/gacha";
import { getTicketImageByCouponId } from "@/lib/tickets";

type Props = {
  onSelectCoupon: (id: string) => void;
};

function getStatus(coupon: UserCoupon): {
  label: string;
  className: string;
} {
  if (coupon.used_at) {
    return { label: "使用済み", className: dpBadgeMuted };
  }
  if (isExpired(coupon.expires_at)) {
    return { label: "期限切れ", className: dpBadgeMuted };
  }
  return { label: "未使用", className: dpBadgeWin };
}

export function CouponListScreen({ onSelectCoupon }: Props) {
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchUserCoupons();
    setCoupons(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto">
      <header className="dp-screen-header">
        <p className={dpLabel}>クーポン</p>
        <h1 className={`${dpTitle} mt-1`}>獲得クーポン</h1>
        <p className={`${dpSubtitle} mt-1`}>
          当たったクーポンはこちらから確認できます
        </p>
      </header>

      {loading && (
        <p className="text-center text-sm text-zinc-500 py-8">
          読み込み中...
        </p>
      )}

      {!loading && coupons.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-sm text-zinc-800">まだクーポンがありません</p>
          <p className="text-sm text-zinc-500 mt-2">
            ガチャでクーポンを獲得できます
          </p>
        </div>
      )}

      <ul className="flex flex-col gap-4 mt-4">
        {coupons.map((coupon) => {
          const status = getStatus(coupon);
          const ticketSrc = getTicketImageByCouponId(coupon.coupon_id);
          const dimmed = Boolean(coupon.used_at) || isExpired(coupon.expires_at);

          return (
            <li key={coupon.id} className={`${dpCardLight} p-3`}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs text-zinc-500">
                  有効期限：{formatDate(coupon.expires_at)}
                </p>
                <span className={`shrink-0 ${status.className}`}>
                  {status.label}
                </span>
              </div>

              {ticketSrc ? (
                <CouponTicket
                  src={ticketSrc}
                  alt={`${coupon.store_name} ${coupon.title}`}
                  dimmed={dimmed}
                />
              ) : (
                <div className="rounded-xl border-2 border-zinc-200 p-4 bg-[#c5db7a]/30">
                  <h2 className="text-base font-bold text-zinc-900">
                    {coupon.title}
                  </h2>
                  <p className="text-sm text-zinc-600 mt-1">
                    {coupon.store_name}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => onSelectCoupon(coupon.id)}
                className={`${dpBtnGhost} mt-3`}
              >
                詳細を見る
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
