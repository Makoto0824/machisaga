"use client";

import { getStoreCoupons } from "@/data/types";
import { useRegion } from "@/components/RegionProvider";
import {
  dpCardLight,
  dpLabel,
  dpLink,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

export function StoreListScreen() {
  const region = useRegion();

  return (
    <div className="flex-1 flex flex-col px-4 pb-4 overflow-y-auto">
      <header className="dp-screen-header">
        <p className={dpLabel}>お店</p>
        <h1 className={`${dpTitle} mt-1`}>参加店舗</h1>
        <p className={`${dpSubtitle} mt-1`}>
          ガチャで当たるクーポンが使えるお店です
        </p>
      </header>

      <ul className="flex flex-col gap-3 mt-4">
        {region.stores.map((store) => {
          const related = getStoreCoupons(region, store.id);
          return (
            <li key={store.id} className={`${dpCardLight} p-4`}>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-base font-bold text-zinc-900">
                  {store.name}
                </h2>
                <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                  {store.category}
                </span>
              </div>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                {store.description}
              </p>
              {related.length > 0 && (
                <p className="text-xs text-zinc-500 mt-2">
                  関連クーポン：{related.map((c) => c.title).join("、")}
                </p>
              )}
              {store.url && (
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${dpLink} mt-3`}
                >
                  Googleマップで見る
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
