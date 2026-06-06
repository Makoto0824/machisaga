"use client";

export type Screen = "gacha" | "coupons" | "stores";

type Props = {
  current: Screen;
  onNavigate: (screen: Screen) => void;
};

const items: {
  id: Screen;
  label: string;
  dotClass: string;
}[] = [
  { id: "gacha", label: "ガチャ", dotClass: "fun-nav-dot-gacha" },
  { id: "coupons", label: "クーポン", dotClass: "fun-nav-dot-coupons" },
  { id: "stores", label: "店舗", dotClass: "fun-nav-dot-stores" },
];

export function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="tab-bar-fixed border-t-[3px] border-[#222] bg-white/95 backdrop-blur-sm safe-area-bottom shadow-[0_-4px_0_var(--fun-sky)]">
      <div className="flex">
        {items.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex-1 py-3 text-xs font-bold tracking-wider transition-all ${
                active
                  ? "text-[#222] scale-105"
                  : "text-zinc-500 opacity-70"
              }`}
            >
              <span
                className={`fun-nav-dot ${item.dotClass} ${
                  active ? "scale-125" : "opacity-40"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
