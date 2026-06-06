"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import type { DotLottie } from "@lottiefiles/dotlottie-web";
import { publicPath } from "@/lib/paths";
import { forwardRef, useImperativeHandle, useRef } from "react";

export const CONFETTI_LOTTIE_SRC = publicPath("/assets/lottie/confetti.lottie");
const CONFETTI_SCALE = 2.0;

export type ConfettiLottieHandle = {
  play: () => Promise<void>;
};

type Props = {
  className?: string;
};

export const ConfettiLottie = forwardRef<ConfettiLottieHandle, Props>(
  function ConfettiLottie({ className }, ref) {
    const dotLottieRef = useRef<DotLottie | null>(null);

    useImperativeHandle(ref, () => ({
      play: () =>
        new Promise((resolve) => {
          const player = dotLottieRef.current;
          if (!player) {
            resolve();
            return;
          }

          const onComplete = () => {
            player.removeEventListener("complete", onComplete);
            resolve();
          };

          player.addEventListener("complete", onComplete);
          player.stop();
          player.play();
        }),
    }));

    return (
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center pointer-events-none ${className ?? ""}`}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `scale(${CONFETTI_SCALE})`,
            transformOrigin: "center center",
          }}
        >
          <DotLottieReact
            src={CONFETTI_LOTTIE_SRC}
            loop={false}
            autoplay={false}
            layout={{ fit: "contain", align: [0.5, 0.5] }}
            renderConfig={{ autoResize: true }}
            className="w-full h-full"
            dotLottieRefCallback={(instance) => {
              dotLottieRef.current = instance;
            }}
          />
        </div>
      </div>
    );
  }
);
