"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { resolveUserId } from "@/lib/user";
import { isSupabaseConfigured } from "@/lib/supabase";

type AuthState =
  | { status: "loading" }
  | { status: "ready"; userId: string }
  | { status: "error"; message: string };

const AuthContext = createContext<AuthState>({ status: "loading" });

type Props = {
  children: ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const initialize = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const userId = await resolveUserId();
      setState({ status: "ready", userId });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "ユーザー認証の初期化に失敗しました";
      setState({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (state.status === "loading") {
    return (
      <MobileFrame>
        <main className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center min-h-0">
          <p className="text-sm font-bold text-zinc-700">読み込み中…</p>
          {isSupabaseConfigured() ? (
            <p className="text-xs text-zinc-500 max-w-xs">
              ユーザー情報を準備しています
            </p>
          ) : null}
        </main>
      </MobileFrame>
    );
  }

  if (state.status === "error") {
    return (
      <MobileFrame>
        <main className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center min-h-0">
          <p className="text-base font-bold text-zinc-900">
            接続できませんでした
          </p>
          <p className="text-sm text-zinc-600 max-w-xs">{state.message}</p>
          <button
            type="button"
            onClick={() => void initialize()}
            className="px-4 py-2 rounded-xl bg-white text-sm font-bold dp-chunky-border-sm"
          >
            再試行
          </button>
        </main>
      </MobileFrame>
    );
  }

  return (
    <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): Extract<AuthState, { status: "ready" }> {
  const state = useContext(AuthContext);
  if (state.status !== "ready") {
    throw new Error("useAuth must be used when auth is ready");
  }
  return state;
}

export function useAuthState(): AuthState {
  return useContext(AuthContext);
}
