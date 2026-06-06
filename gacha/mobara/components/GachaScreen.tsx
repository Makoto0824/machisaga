"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConfettiLottie,
  type ConfettiLottieHandle,
} from "@/components/ConfettiLottie";
import { CouponTicket } from "@/components/CouponTicket";
import {
  getRemainingPlays,
  playGacha,
  resetUserCoupons,
  type GachaResult,
} from "@/lib/gacha";
import {
  isTestUnlimitedEnabled,
  toggleTestUnlimited,
} from "@/lib/testMode";
import { playCongratulationsSound, playTooBadSound } from "@/lib/sounds";
import { publicPath } from "@/lib/paths";
import { getTicketImageByCouponId } from "@/lib/tickets";
import {
  dpBtnPrimary,
  dpBtnSecondary,
  dpLabel,
  dpMediaFrame,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

const GACHA_VIDEO_SRC = publicPath("/assets/videos/gacha.mp4");

type Props = {
  onViewCoupons: () => void;
  onViewStores: () => void;
};

type Phase = "idle" | "spinning" | "result";

function waitForVideoEnd(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("ended", onEnd);
      video.removeEventListener("error", onError);
    };
    const onEnd = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("video playback failed"));
    };
    video.addEventListener("ended", onEnd);
    video.addEventListener("error", onError);
  });
}

async function playGachaVideo(video: HTMLVideoElement | null): Promise<void> {
  if (!video) {
    await new Promise((r) => setTimeout(r, 1200));
    return;
  }
  try {
    video.pause();
    video.currentTime = 0;
    video.muted = false;
    video.volume = 1;
    await video.play();
    await waitForVideoEnd(video);
  } catch {
    await new Promise((r) => setTimeout(r, 1200));
  }
}

export function GachaScreen({ onViewCoupons, onViewStores }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const confettiRef = useRef<ConfettiLottieHandle>(null);
  const [remaining, setRemaining] = useState(3);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lottiePlaying, setLottiePlaying] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const [limitMessage, setLimitMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultAnimKey, setResultAnimKey] = useState(0);
  const [testUnlimited, setTestUnlimited] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV === "development";

  const refreshRemaining = useCallback(async () => {
    const count = await getRemainingPlays();
    setRemaining(count);
  }, []);

  useEffect(() => {
    refreshRemaining();
    setTestUnlimited(isTestUnlimitedEnabled());
  }, [refreshRemaining]);

  const handleToggleTestUnlimited = () => {
    const enabled = toggleTestUnlimited();
    setTestUnlimited(enabled);
    if (enabled) setLimitMessage(false);
    refreshRemaining();
  };

  const handleResetCoupons = async () => {
    const ok = await resetUserCoupons();
    setResetMessage(ok ? "クーポンをリセットしました" : "リセットに失敗しました");
    setTimeout(() => setResetMessage(null), 2500);
  };

  const resetVideoToStart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  }, []);

  useEffect(() => {
    if (phase === "idle") {
      resetVideoToStart();
      setLottiePlaying(false);
    }
  }, [phase, resetVideoToStart]);

  const handlePlay = async () => {
    if (loading || phase === "spinning") return;
    setLimitMessage(false);
    setLoading(true);
    setPhase("spinning");
    setLottiePlaying(false);
    setResult(null);

    await playGachaVideo(videoRef.current);

    const outcome = await playGacha();
    setLoading(false);

    if (!outcome.ok) {
      setPhase("idle");
      setLimitMessage(true);
      setRemaining(0);
      return;
    }

    setResult(outcome.result);
    setRemaining(outcome.result.remaining);
    setResultAnimKey((k) => k + 1);
    setPhase("result");

    if (outcome.result.resultType === "win") {
      playCongratulationsSound();
      setLottiePlaying(true);
      void confettiRef.current?.play().finally(() => setLottiePlaying(false));
    } else {
      playTooBadSound();
    }
  };

  const handleReset = () => {
    setPhase("idle");
    setResult(null);
    setLimitMessage(false);
    setLottiePlaying(false);
    resetVideoToStart();
    refreshRemaining();
  };

  const showVideo = phase === "idle" || (phase === "spinning" && !lottiePlaying);

  return (
    <div className="flex-1 flex flex-col px-4 pb-4">
      <header className="dp-screen-header">
        <p className={dpLabel}>まちサーガ</p>
        <h1 className={`${dpTitle} mt-1`}>茂原ガチャ</h1>
        <p className={`${dpSubtitle} mt-2`}>
          1日3回までチャレンジできます。参加店舗で使えるクーポンや特典が当たります。
        </p>
      </header>

      <div
        className={`relative mt-4 ${dpMediaFrame} min-h-[200px] ${
          phase === "idle" ? "fun-media-idle" : ""
        } ${
          lottiePlaying ||
          (phase === "result" && result?.resultType === "win")
            ? "overflow-visible"
            : "overflow-hidden"
        }`}
      >
        <video
          ref={videoRef}
          src={GACHA_VIDEO_SRC}
          className={`w-full min-h-[200px] object-contain bg-zinc-100 ${
            showVideo ? "block" : "hidden"
          }`}
          playsInline
          preload="auto"
          muted={false}
          aria-label="ガチャ演出"
        />

        {phase === "idle" && limitMessage && (
          <p className="text-sm text-zinc-600 text-center px-4 py-3 border-t-2 border-[#e0dbd0] bg-white">
            本日のガチャ回数を使い切りました。また明日お試しください。
          </p>
        )}

        {phase === "result" && result?.resultType === "lose" && (
          <div
            className="absolute inset-0 z-[5] bg-black/20 pointer-events-none"
            style={{ animation: "lose-dim 0.5s ease-out both" }}
            aria-hidden
          />
        )}

        {phase === "result" && result && (
          <div className="relative z-10 p-4 w-full min-h-[180px] flex items-center justify-center overflow-visible">
            <ResultDisplay key={resultAnimKey} result={result} />
          </div>
        )}

        <ConfettiLottie
          ref={confettiRef}
          className={lottiePlaying ? "" : "hidden"}
        />
      </div>

      <div className="flex justify-center">
        <div className="fun-count-box">
          <span>本日の残り回数</span>
          {testUnlimited ? (
            <span className="fun-count-num text-xs px-2">∞</span>
          ) : (
            <span className="fun-count-num">{remaining}</span>
          )}
        </div>
      </div>

      {phase !== "result" && (
        <button
          type="button"
          onClick={handlePlay}
          disabled={
            loading ||
            phase === "spinning" ||
            (!testUnlimited && remaining <= 0)
          }
          className={`${dpBtnPrimary} mt-4`}
        >
          {phase === "spinning" ? "ドキドキ中..." : "ガチャを回す！"}
        </button>
      )}

      {phase === "result" && (
        <div className="flex flex-col gap-2 mt-4">
          <button type="button" onClick={onViewCoupons} className={dpBtnPrimary}>
            獲得クーポンを見る
          </button>
          <button type="button" onClick={onViewStores} className={dpBtnSecondary}>
            参加店舗を見る
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={!testUnlimited && remaining <= 0}
            className={`${dpBtnSecondary} disabled:opacity-40`}
          >
            もう一度回す
          </button>
        </div>
      )}

      {isDev && (
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleToggleTestUnlimited}
            className="w-full py-2 rounded-xl border border-dashed border-zinc-300 text-xs text-zinc-500"
          >
            {testUnlimited
              ? "テスト：回数無制限 ON（タップで OFF）"
              : "テスト：回数無制限 OFF（タップで ON）"}
          </button>
          <button
            type="button"
            onClick={handleResetCoupons}
            className="w-full py-2 rounded-xl border border-dashed border-amber-400 text-xs text-amber-700"
          >
            テスト：クーポンをリセット
          </button>
          {resetMessage && (
            <p className="text-center text-xs text-zinc-600">{resetMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultDisplay({ result }: { result: GachaResult }) {
  const { prize, resultType } = result;

  if (resultType === "lose") {
    return (
      <div
        className="text-center px-5 py-5 w-full rounded-2xl bg-white dp-chunky-border-sm"
        style={{
          animation: "lose-sink 0.65s ease-out both",
          transformOrigin: "center center",
        }}
      >
        <p
          className="fun-lose-text tracking-wide"
          style={{
            animation: "lose-shake 0.55s ease-in-out 0.3s both",
          }}
        >
          はずれ…
        </p>
        <p className="text-sm text-zinc-500 mt-3">次は当たるかも！</p>
        <p className="text-sm font-bold text-[#e8384f] mt-2">
          またチャレンジしてみて
        </p>
      </div>
    );
  }

  const ticketSrc = getTicketImageByCouponId(prize.id);

  if (ticketSrc) {
    return (
      <div
        className="w-full"
        style={{
          animation: "win-zoom-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
          transformOrigin: "center center",
          willChange: "transform, opacity",
        }}
      >
        <p className="fun-win-text text-center mb-2 tracking-wide">
          おめでとう！あたり！
        </p>
        <CouponTicket
          src={ticketSrc}
          alt={`${prize.store_name} ${prize.title}`}
        />
      </div>
    );
  }

  return (
    <div
      className="text-center px-5 py-4 w-full rounded-2xl bg-[#b8e06a] text-zinc-900 dp-chunky-border-sm"
      style={{
        animation: "win-zoom-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        transformOrigin: "center center",
        willChange: "transform, opacity",
      }}
    >
      <p className="inline-block text-[10px] font-bold tracking-wider text-zinc-900 bg-amber-400 px-3 py-1 rounded">
        当選
      </p>
      <p className="text-sm font-bold text-zinc-900 mt-3">
        おめでとうございます
      </p>
      <p className="text-xl font-bold text-zinc-900 mt-2">{prize.title}</p>
      {prize.store_name && (
        <p className="text-sm text-zinc-700 mt-1">{prize.store_name}</p>
      )}
      <p className="text-sm text-zinc-700 mt-2 leading-relaxed">
        {prize.description}
      </p>
    </div>
  );
}
