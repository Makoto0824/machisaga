import { publicPath } from "@/lib/paths";

const CONGRATULATIONS_SRC = publicPath("/assets/sounds/congrats.mp3");
const TOO_BAD_SRC = publicPath("/assets/sounds/se_too_bad.mp3");

let congratulationsAudio: HTMLAudioElement | null = null;
let tooBadAudio: HTMLAudioElement | null = null;

function playSound(audio: HTMLAudioElement | null, src: string): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
  }
  audio.currentTime = 0;
  void audio.play().catch(() => {
    // 自動再生ポリシー等で失敗しても演出は続行
  });
  return audio;
}

export function playCongratulationsSound(): void {
  if (typeof window === "undefined") return;
  congratulationsAudio = playSound(congratulationsAudio, CONGRATULATIONS_SRC);
}

export function playTooBadSound(): void {
  if (typeof window === "undefined") return;
  tooBadAudio = playSound(tooBadAudio, TOO_BAD_SRC);
}
