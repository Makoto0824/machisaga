"use client";

import { dpBtnPrimary } from "@/components/ui/theme";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fun-page-bg text-zinc-900">
      <h1 className="text-base font-bold mb-2">表示エラーが発生しました</h1>
      <p className="text-sm text-zinc-600 mb-4 text-center max-w-md">
        {error.message || "不明なエラー"}
      </p>
      <button type="button" onClick={reset} className={`${dpBtnPrimary} max-w-xs`}>
        再読み込み
      </button>
    </div>
  );
}
