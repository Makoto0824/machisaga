export type Store = {
  id: string;
  name: string;
  category: string;
  description: string;
  hours?: string;
  url?: string;
  /** 参加店舗一覧に表示するか（未指定時は true） */
  showInStoreList?: boolean;
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

export type RegionConfig = {
  slug: string;
  name: string;
  title: string;
  description: string;
  tagline: string;
  stores: Store[];
  couponPrizes: CouponPrize[];
  ticketImages: Record<string, string>;
  storeCardImages: Record<string, string>;
};

export function getStoreCoupons(
  region: RegionConfig,
  storeId: string
): CouponPrize[] {
  return region.couponPrizes.filter(
    (c) => c.store_id === storeId && !c.is_miss && c.is_active
  );
}

export function getVisibleStores(region: RegionConfig): Store[] {
  return region.stores.filter((store) => store.showInStoreList !== false);
}
