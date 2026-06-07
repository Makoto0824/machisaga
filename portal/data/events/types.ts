export type EventCategory = "mobara-city" | "asmo" | "store";

export type RegionEvent = {
  id: string;
  category: EventCategory;
  title: string;
  summary: string;
  startDate: string;
  endDate: string;
  detailUrl: string;
  venue?: string;
  storeId?: string;
  isActive: boolean;
};

export type RegionEventList = RegionEvent[];
