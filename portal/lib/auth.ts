import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const LOCAL_USER_ID_KEY = "machisaga_user_id";

let cachedUserId: string | null = null;
let authPromise: Promise<string> | null = null;
let authListenerRegistered = false;

function getOrCreateLocalUserId(): string {
  if (typeof window === "undefined") {
    return "demo-user-001";
  }

  const existing = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(LOCAL_USER_ID_KEY, id);
  return id;
}

function registerAuthListener(): void {
  if (authListenerRegistered || !isSupabaseConfigured()) return;

  const supabase = getSupabase();
  if (!supabase) return;

  authListenerRegistered = true;
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedUserId = session?.user?.id ?? null;
  });
}

/**
 * ユーザー ID を確定する。
 * - Supabase 設定時: Anonymous Auth の session.user.id
 * - 未設定時: 端末ごとの localStorage UUID
 */
export async function resolveUserId(): Promise<string> {
  if (cachedUserId) return cachedUserId;
  if (authPromise) return authPromise;

  authPromise = (async () => {
    if (!isSupabaseConfigured()) {
      cachedUserId = getOrCreateLocalUserId();
      return cachedUserId;
    }

    registerAuthListener();

    const supabase = getSupabase()!;
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    if (sessionData.session?.user?.id) {
      cachedUserId = sessionData.session.user.id;
      return cachedUserId;
    }

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user?.id) {
      throw error ?? new Error("Anonymous sign-in failed");
    }

    cachedUserId = data.user.id;
    return cachedUserId;
  })();

  try {
    return await authPromise;
  } finally {
    authPromise = null;
  }
}

/** ensureAuth 完了後のみ利用（同期 API 向け） */
export function getCurrentUserId(): string {
  if (cachedUserId) return cachedUserId;

  if (!isSupabaseConfigured()) {
    return getOrCreateLocalUserId();
  }

  throw new Error("Auth not ready. Call resolveUserId() first.");
}

export function isAuthReady(): boolean {
  return cachedUserId !== null || !isSupabaseConfigured();
}
