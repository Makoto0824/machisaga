"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BottomNav, type Screen } from "@/components/BottomNav";
import { CouponDetailScreen } from "@/components/CouponDetailScreen";
import { CouponListScreen } from "@/components/CouponListScreen";
import { ChanceScreen } from "@/components/ChanceScreen";
import { MobileFrame } from "@/components/MobileFrame";
import { StoreListScreen } from "@/components/StoreListScreen";
import { parseTabParam, replaceTabInUrl } from "@/lib/tab";

type View =
  | { screen: "chance" }
  | { screen: "coupons" }
  | { screen: "stores" }
  | { screen: "couponDetail"; couponId: string };

function RegionHomeContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [view, setView] = useState<View>(() => ({
    screen: parseTabParam(tabParam),
  }));

  useEffect(() => {
    setView((current) => {
      if (current.screen === "couponDetail") return current;
      const next = parseTabParam(tabParam);
      return current.screen === next ? current : { screen: next };
    });
  }, [tabParam]);

  const navigateToScreen = useCallback((screen: Screen) => {
    setView({ screen });
    replaceTabInUrl(screen);
  }, []);

  const bottomScreen: Screen =
    view.screen === "couponDetail" ? "coupons" : view.screen;

  return (
    <MobileFrame>
      <main
        className={`flex-1 flex flex-col overflow-hidden min-h-0 ${
          view.screen !== "couponDetail" ? "with-tab-bar" : ""
        }`}
      >
        {view.screen === "chance" && (
          <ChanceScreen onViewCoupons={() => navigateToScreen("coupons")} />
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
            onBack={() => navigateToScreen("coupons")}
          />
        )}
        {view.screen === "stores" && <StoreListScreen />}
      </main>

      {view.screen !== "couponDetail" && (
        <BottomNav current={bottomScreen} onNavigate={navigateToScreen} />
      )}
    </MobileFrame>
  );
}

export default function RegionHome() {
  return (
    <Suspense
      fallback={
        <MobileFrame>
          <main className="flex-1 flex flex-col overflow-hidden min-h-0 with-tab-bar" />
        </MobileFrame>
      }
    >
      <RegionHomeContent />
    </Suspense>
  );
}
