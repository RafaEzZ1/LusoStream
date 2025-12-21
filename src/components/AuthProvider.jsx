"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthCtx = createContext({ user: null, role: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function hydrate() {
    const { data: sess } = await supabase.auth.getSession(); // lê DE imediato do storage
    const u = sess?.session?.user || null;
    setUser(u);

    if (u) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", u.id)
        .maybeSingle();
      setRole(data?.role || "user");
    } else {
      setRole(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    hydrate();
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", u.id)
          .maybeSingle();
        setRole(data?.role || "user");
      } else {
        setRole(null);
      }
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function signOut() {
    try { await supabase.auth.signOut({ scope: "global" }); } catch {}
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) if (k.startsWith("sb-")) localStorage.removeItem(k);
    } catch {}
    setUser(null);
    setRole(null);
    window.location.assign("/auth");
  }

  return (
    <AuthCtx.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
