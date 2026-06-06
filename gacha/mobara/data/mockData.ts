export type Store = {
  id: string;
  name: string;
  category: string;
  description: string;
  hours?: string;
  url?: string;
};

export type CouponPrize = {
  id: string;
  store_id: string | null;
  store_name: string;
  title: string;
  description: string;
  usage_condition: string;
  probability: number;
  expires_days: number;
  is_active: boolean;
  is_miss?: boolean;
};

export const STORES: Store[] = [
  {
    id: "store-kurofune",
    name: "茂原黒船",
    category: "創作スイーツ",
    description:
      "茂原で50年創作スイーツ店。初代ジャムロールが有名で、地元に愛されるスイーツ作りに取り組んでいます。",
    url: "https://maps.app.goo.gl/jnwC2n9CkTXoMEzW9",
  },
  {
    id: "store-laughin",
    name: "バーガーキッチン ラフィン",
    category: "ハンバーガー",
    description:
      "茂原市で唯一のハンバーガー専門店。安心・安全食材で19種のバーガーをご用意。ラフィンでHappy & Smile",
    url: "https://maps.app.goo.gl/HmMZdxZqU7AaPze48",
  },
  {
    id: "store-reve",
    name: "創作スイーツ＆フレンチ レーヴ",
    category: "創作スイーツ・フレンチ",
    description:
      "店名のレーヴは仏語で『夢』を表しています。『夢を叶える力になる』地産地消スイーツ。低アレルギー対応、予約制フレンチのお店。",
    url: "https://maps.app.goo.gl/qcVYn9hGYGA7jvvE6",
  },
];

export const COUPON_PRIZES: CouponPrize[] = [
  {
    id: "coupon-kurofune-jamroll",
    store_id: "store-kurofune",
    store_name: "茂原黒船",
    title: "ジャムロール50円引き",
    description:
      "人気の初代ジャムロールを50円引き。茂原の創作スイーツをお得にお楽しみください。",
    usage_condition: "ジャムロール1本購入時・他クーポン併用不可",
    probability: 22,
    expires_days: 30,
    is_active: true,
  },
  {
    id: "coupon-laughin-potato",
    store_id: "store-laughin",
    store_name: "バーガーキッチン ラフィン",
    title: "ポテトSサービス",
    description:
      "バーガーご注文の方にポテトSを1つプレゼント。19種のバーガーからお好みをお選びください。",
    usage_condition: "バーガー1品以上のご注文時",
    probability: 22,
    expires_days: 30,
    is_active: true,
  },
  {
    id: "coupon-reve-sweets",
    store_id: "store-reve",
    store_name: "創作スイーツ＆フレンチ レーヴ",
    title: "テイクアウトスイーツ100円引き",
    description:
      "地産地消の創作スイーツを100円引き。夢を叶えるスイーツをお持ち帰りください。",
    usage_condition: "テイクアウトスイーツ購入時",
    probability: 22,
    expires_days: 30,
    is_active: true,
  },
  {
    id: "coupon-miss",
    store_id: null,
    store_name: "",
    title: "はずれ",
    description: "また明日チャレンジしてください。",
    usage_condition: "",
    probability: 34,
    expires_days: 0,
    is_active: true,
    is_miss: true,
  },
];

export function getStoreCoupons(storeId: string): CouponPrize[] {
  return COUPON_PRIZES.filter((c) => c.store_id === storeId && !c.is_miss);
}
