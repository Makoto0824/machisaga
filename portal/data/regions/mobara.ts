import type { RegionConfig } from "@/data/types";
import { publicPath } from "@/lib/paths";

export const mobara: RegionConfig = {
  slug: "mobara",
  name: "茂原市",
  title: "まちサーガ茂原市チャンス",
  description:
    "1日3回までチャレンジ！参加店舗で使えるクーポンが当たるチャンス",
  tagline:
    "1日3回までチャレンジできます。参加店舗で使えるクーポンや特典が当たります。",
  stores: [
    {
      id: "store-kurofune",
      name: "茂原黒船",
      category: "創作スイーツ",
      description:
        "茂原市で50年創作スイーツ店。初代ジャムロールが有名で、地元に愛されるスイーツ作りに取り組んでいます。",
      url: "https://maps.app.goo.gl/jnwC2n9CkTXoMEzW9",
    },
    {
      id: "store-morphee",
      name: "株式会社morphee",
      category: "美容・健康",
      description:
        "地域で唯一の医療美容師在籍の美容室。抗がん剤治療前後の方のウィッグカットご相談ください。学生カットも得意です。",
      url: "https://maps.app.goo.gl/Z68LDW9ZFAyaVjzg6",
    },
    {
      id: "store-laughin",
      name: "バーガーキッチン ラフィン",
      category: "ハンバーガー",
      description:
        "茂原市で唯一のハンバーガー専門店。安心・安全食材で19種のバーガーをご用意。ラフィンでHappy & Smile",
      url: "https://maps.app.goo.gl/HmMZdxZqU7AaPze48",
      showInStoreList: false,
    },
    {
      id: "store-reve",
      name: "創作スイーツ＆フレンチ レーヴ",
      category: "創作スイーツ・フレンチ",
      description:
        "店名のレーヴは仏語で『夢』を表しています。『夢を叶える力になる』地産地消スイーツ。低アレルギー対応、予約制フレンチのお店。",
      url: "https://maps.app.goo.gl/qcVYn9hGYGA7jvvE6",
      showInStoreList: false,
    },
  ],
  couponPrizes: [
    {
      id: "coupon-kurofune-acai-topping",
      store_id: "store-kurofune",
      store_name: "茂原黒船",
      title: "アサイーボウルトッピング1個サービス",
      description:
        "アサイーボウルにトッピング1個をサービス。茂原市の創作スイーツをお得にお楽しみください。",
      usage_condition: "アサイーボウル1杯購入時・他クーポン併用不可",
      probability: 16,
      expires_days: 30,
      is_active: true,
    },
    {
      id: "coupon-kurofune-all-10off",
      store_id: "store-kurofune",
      store_name: "茂原黒船",
      title: "全品10%OFF",
      description:
        "店内商品が10%OFF。茂原市の創作スイーツをお得にお楽しみください。",
      usage_condition: "全品対象・他クーポン併用不可",
      probability: 17,
      expires_days: 30,
      is_active: true,
    },
    {
      id: "coupon-morphee-bangs-cut",
      store_id: "store-morphee",
      store_name: "株式会社morphee",
      title: "前髪カット¥1100→¥550",
      description: "前髪カットを550円でご利用いただけます（通常1,100円）。",
      usage_condition: "事前予約・他クーポンとの併用不可",
      probability: 16,
      expires_days: 30,
      fixed_end_date: "2026-08-31",
      is_active: true,
    },
    {
      id: "coupon-morphee-first-10off",
      store_id: "store-morphee",
      store_name: "株式会社morphee",
      title: "初回限定10%OFF",
      description: "初回限定で10%OFF。カット・カラー・パーマ・トリートメントが対象です。",
      usage_condition:
        "事前予約・10%オフはカット、カラー、パーマ、トリートメントで使用可・他クーポンとの併用不可",
      probability: 17,
      expires_days: 30,
      fixed_end_date: "2026-08-31",
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
      probability: 0,
      expires_days: 30,
      is_active: false,
    },
    {
      id: "coupon-reve-sweets",
      store_id: "store-reve",
      store_name: "創作スイーツ＆フレンチ レーヴ",
      title: "テイクアウトスイーツ100円引き",
      description:
        "地産地消の創作スイーツを100円引き。夢を叶えるスイーツをお持ち帰りください。",
      usage_condition: "テイクアウトスイーツ購入時",
      probability: 0,
      expires_days: 30,
      is_active: false,
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
  ],
  ticketImages: {
    "coupon-kurofune-acai-topping": publicPath(
      "/assets/images/tickets/kurofune1.png"
    ),
    "coupon-kurofune-all-10off": publicPath(
      "/assets/images/tickets/kurofune2.png"
    ),
    "coupon-morphee-bangs-cut": publicPath(
      "/assets/images/tickets/morphee1.png"
    ),
    "coupon-morphee-first-10off": publicPath(
      "/assets/images/tickets/morphee2.png"
    ),
    "store-laughin": publicPath("/assets/images/tickets/laughin1.png"),
    "store-reve": publicPath("/assets/images/tickets/reve1.png"),
  },
  storeCardImages: {
    "store-kurofune": publicPath("/assets/images/trading-card/card1.png"),
    "store-morphee": publicPath("/assets/images/trading-card/card11.png"),
    "store-laughin": publicPath("/assets/images/trading-card/card3.png"),
    "store-reve": publicPath("/assets/images/trading-card/card2.png"),
  },
};
