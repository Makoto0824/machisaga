"use client";

import { useState } from "react";
import { BottomNav, type Screen } from "@/components/BottomNav";
import { CouponDetailScreen } from "@/components/CouponDetailScreen";
import { CouponListScreen } from "@/components/CouponListScreen";
import { ChanceScreen } from "@/components/ChanceScreen";
import { MobileFrame } from "@/components/MobileFrame";
import { StoreListScreen } from "@/components/StoreListScreen";

type View =
  | { screen: "chance" }
  | { screen: "coupons" }
  | { screen: "stores" }
  | { screen: "couponDetail"; couponId: string };

export default function RegionHome() {
  const [view, setView] = useState<View>({ screen: "chance" });

  const bottomScreen: Screen =
    view.screen === "couponDetail" ? "coupons" : view.screen;

  const handleNav = (screen: Screen) => {
    setView({ screen });
  };

  return (
    <MobileFrame>
      <main
        className={`flex-1 flex flex-col overflow-hidden min-h-0 ${
          view.screen !== "couponDetail" ? "with-tab-bar" : ""
        }`}
      >
        {view.screen === "chance" && (
          <ChanceScreen
            onViewCoupons={() => setView({ screen: "coupons" })}
          />
        )}
        {view.screen === "coupons" && (
          <CouponListScreen
            onSelectCoupon={(id) =>
              setView({ screen: "couponDetail", couponId: id })
            }
          />
        )}
        {view.screen === "couponDetail" && (
          <CouponDetailScreen
            couponId={view.couponId}
            onBack={() => setView({ screen: "coupons" })}
          />
        )}
        {view.screen === "stores" && <StoreListScreen />}
      </main>

      {view.screen !== "couponDetail" && (
        <BottomNav current={bottomScreen} onNavigate={handleNav} />
      )}
    </MobileFrame>
  );
}
