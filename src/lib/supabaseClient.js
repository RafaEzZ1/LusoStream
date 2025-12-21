// src/lib/supabaseClient.js
"use client";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// chave estável na localStorage
export const STORAGE_KEY = "flxtuga-auth-v1";

let _supabase;
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storageKey: STORAGE_KEY,
      },
    });
  }
  return _supabase;
}

export const supabase = getSupabase();

// inicializa hidratação/refresh da sessão no arranque e em foco
let _bootstrapped = false;
export function initAuthListeners() {
  if (_bootstrapped) return;
  _bootstrapped = true;

  supabase.auth.getSession().catch(() => {});

  const refresh = () => supabase.auth.getSession().catch(() => {});
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refresh();
  });
}

export async function hardLogout() {
  try { await supabase.auth.signOut({ scope: "global" }); } catch {}
  try {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      if (k.startsWith("sb-") || k.startsWith("supabase")) localStorage.removeItem(k);
    }
  } catch {}
  window.location.assign("/auth");
}
