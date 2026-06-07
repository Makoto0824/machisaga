/** 外部サイト紹介（茂原市・アスモ） */
export type EventLinkCategory = "mobara-city" | "asmo";

export type EventLinkRef = {
  id: string;
  category: EventLinkCategory;
  title: string;
  summary: string;
  detailUrl: string;
  isActive: boolean;
};

/** 参加店舗の個別イベント（手動更新） */
export type StoreEvent = {
  id: string;
  storeId: string;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  detailUrl: string;
  venue?: string;
  isActive: boolean;
};

export type RegionEventsData = {
  links: EventLinkRef[];
  storeEvents: StoreEvent[];
};
