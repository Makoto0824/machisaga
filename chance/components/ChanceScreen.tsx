"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConfettiLottie,
  type ConfettiLottieHandle,
} from "@/components/ConfettiLottie";
import { CouponTicket } from "@/components/CouponTicket";
import {
  getPlayBlockReason,
  getRemainingPlays,
  playChance,
  resetUserCoupons,
  type ChanceResult,
  type PlayBlockReason,
} from "@/lib/chance";
import {
  isTestToolsEnabled,
  isTestUnlimitedEnabled,
  toggleTestUnlimited,
} from "@/lib/testMode";
import { playCongratulationsSound, playTooBadSound } from "@/lib/sounds";
import { publicPath } from "@/lib/paths";
import { getTicketImageByCouponId } from "@/lib/tickets";
import { useRegion } from "@/components/RegionProvider";
import {
  dpBtnPrimary,
  dpBtnSecondary,
  dpLabel,
  dpMediaFrame,
  dpSubtitle,
  dpTitle,
} from "@/components/ui/theme";

const CHANCE_VIDEO_SRC = publicPath("/assets/videos/chance.mp4");

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

async function playChanceVideo(video: HTMLVideoElement | null): Promise<void> {
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

export function ChanceScreen({ onViewCoupons, onViewStores }: Props) {
  const region = useRegion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const confettiRef = useRef<ConfettiLottieHandle>(null);
  const [remaining, setRemaining] = useState(3);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lottiePlaying, setLottiePlaying] = useState(false);
  const [result, setResult] = useState<ChanceResult | null>(null);
  const [blockReason, setBlockReason] = useState<PlayBlockReason | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultAnimKey, setResultAnimKey] = useState(0);
  const [testUnlimited, setTestUnlimited] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const showTestTools = isTestToolsEnabled();

  const refreshPlayStatus = useCallback(async () => {
    const [count, reason] = await Promise.all([
      getRemainingPlays(),
      getPlayBlockReason(),
    ]);
    setRemaining(count);
    setBlockReason(reason);
  }, []);

  useEffect(() => {
    refreshPlayStatus();
    setTestUnlimited(isTestUnlimitedEnabled());
  }, [refreshPlayStatus]);

  const handleToggleTestUnlimited = () => {
    const enabled = toggleTestUnlimited();
    setTestUnlimited(enabled);
    if (enabled) setBlockReason(null);
    refreshPlayStatus();
  };

  const handleResetCoupons = async () => {
    const ok = await resetUserCoupons();
    if (ok) {
      setBlockReason(null);
      await refreshPlayStatus();
    }
    setResetMessage(
      ok ? "チケットと回数をリセットしました" : "リセットに失敗しました"
    );
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

  const isPlayBlocked =
    !testUnlimited &&
    (blockReason !== null || remaining <= 0);

  const handlePlay = async () => {
    if (loading || phase === "spinning" || isPlayBlocked) return;
    setBlockReason(null);
    setLoading(true);
    setPhase("spinning");
    setLottiePlaying(false);
    setResult(null);

    await playChanceVideo(videoRef.current);

    const outcome = await playChance();
    setLoading(false);

    if (!outcome.ok) {
      setPhase("idle");
      setBlockReason(outcome.reason);
      if (outcome.reason === "daily_limit") setRemaining(0);
      return;
    }

    setResult(outcome.result);
    setResultAnimKey((k) => k + 1);
    await refreshPlayStatus();
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
    setLottiePlaying(false);
    resetVideoToStart();
    refreshPlayStatus();
  };

  const showVideo = phase === "idle" || (phase === "spinning" && !lottiePlaying);

  return (
    <div className="flex-1 flex flex-col px-4 pb-4">
      <header className="dp-screen-header">
        <p className={dpLabel}>まちサーガ</p>
        <h1 className={`${dpTitle} mt-1`}>{region.name}チャンス</h1>
        <p className={`${dpSubtitle} mt-2`}>{region.tagline}</p>
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
          src={CHANCE_VIDEO_SRC}
          className={`w-full min-h-[200px] object-contain bg-zinc-100 ${
            showVideo ? "block" : "hidden"
          }`}
          playsInline
          preload="auto"
          muted={false}
          aria-label="チャンス演出"
        />

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

      {blockReason && phase !== "result" && (
        <PlayBlockNotice reason={blockReason} onViewCoupons={onViewCoupons} />
      )}

      {phase !== "result" && (
        <button
          type="button"
          onClick={handlePlay}
          disabled={loading || phase === "spinning" || isPlayBlocked}
          className={`${dpBtnPrimary} mt-4`}
        >
          {phase === "spinning" ? "ドキドキ中..." : "挑戦！"}
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
            disabled={isPlayBlocked}
            className={`${dpBtnSecondary} disabled:opacity-40`}
          >
            もう一度挑戦
          </button>
          {blockReason && (
            <PlayBlockNotice reason={blockReason} onViewCoupons={onViewCoupons} />
          )}
        </div>
      )}

      {showTestTools && (
        <section
          className="mt-6 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-3 flex flex-col gap-2"
          aria-label="テスト用ツール"
        >
          <p className="text-center text-[10px] font-bold tracking-wider text-amber-800">
            テスト用
          </p>
          <button
            type="button"
            onClick={handleToggleTestUnlimited}
            className={`w-full py-2.5 rounded-xl border text-xs font-bold ${
              testUnlimited
                ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                : "border-zinc-300 bg-white text-zinc-600"
            }`}
          >
            {testUnlimited
              ? "回数無制限 ON（タップで OFF）"
              : "回数無制限 OFF（タップで ON）"}
          </button>
          <button
            type="button"
            onClick={handleResetCoupons}
            className="w-full py-2.5 rounded-xl border border-amber-500 bg-white text-xs font-bold text-amber-800"
          >
            チケット・回数をリセット
          </button>
          {resetMessage && (
            <p className="text-center text-xs text-zinc-600">{resetMessage}</p>
          )}
        </section>
      )}
    </div>
  );
}

function PlayBlockNotice({
  reason,
  onViewCoupons,
}: {
  reason: PlayBlockReason;
  onViewCoupons: () => void;
}) {
  if (reason === "ticket_limit") {
    return (
      <div
        role="alert"
        className="mt-4 rounded-xl border-2 border-[#e8384f] bg-[#fff5f5] px-4 py-3 text-center"
      >
        <p className="text-sm font-bold text-[#c41e3a]">
          獲得できるチケットの上限に達しました
        </p>
        <p className="text-xs text-zinc-700 mt-2 leading-relaxed">
          お手持ちのクーポンを店舗でご利用いただくか、有効期限が過ぎてから再度お試しください。
        </p>
        <button
          type="button"
          onClick={onViewCoupons}
          className="mt-3 text-xs font-bold text-[#c41e3a] underline"
        >
          獲得クーポンを確認する
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-3 text-center"
    >
      <p className="text-sm font-bold text-amber-900">
        本日の挑戦回数を使い切りました
      </p>
      <p className="text-xs text-zinc-700 mt-2 leading-relaxed">
        1日3回まで挑戦できます。また明日お試しください。
      </p>
    </div>
  );
}

function ResultDisplay({ result }: { result: ChanceResult }) {
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
