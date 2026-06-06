import type { RegionConfig } from "@/data/types";
import { publicPath } from "@/lib/paths";

/** 将来の渋谷版など追加地域用の仮置きデータ */
export const hogeCity: RegionConfig = {
  slug: "hoge-city",
  name: "ほげ市",
  title: "まちサーガほげ市ガチャ（準備中）",
  description: "ほげ市エリアのガチャ（デモ・仮置き）",
  tagline: "デモ用の仮置き地域です。店舗・景品データは後から差し替えます。",
  stores: [
    {
      id: "store-hoge-demo",
      name: "ほげ商店（デモ）",
      category: "デモ店舗",
      description: "地域追加時のプレースホルダー店舗です。",
      url: undefined,
    },
  ],
  couponPrizes: [
    {
      id: "coupon-hoge-demo",
      store_id: "store-hoge-demo",
      store_name: "ほげ商店（デモ）",
      title: "デモクーポン100円引き",
      description: "仮置き用のサンプルクーポンです。",
      usage_condition: "デモ用・実店舗では使用できません",
      probability: 40,
      expires_days: 30,
      is_active: true,
    },
    {
      id: "coupon-hoge-miss",
      store_id: null,
      store_name: "",
      title: "はずれ",
      description: "また明日チャレンジしてください。",
      usage_condition: "",
      probability: 60,
      expires_days: 0,
      is_active: true,
      is_miss: true,
    },
  ],
  ticketImages: {
    "store-hoge-demo": publicPath("/assets/images/tickets/kurofune1.png"),
  },
};
