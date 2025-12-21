// src/hooks/useAuthRole.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** Hidrata sessão assim que o app arranca e mantém em sync via onAuthStateChange */
export function useAuthUser() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    session: null,
  });

  useEffect(() => {
    let mounted = true;

    // 1) ler sessão atual
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        loading: false,
        user: data?.session?.user || null,
        session: data?.session || null,
      });
    });

    // 2) subscrever a eventos (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT, etc.)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({
        loading: false,
        user: session?.user || null,
        session: session || null,
      });
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return state; // { loading, user, session }
}

/** Lê role do utilizador em `profiles.role` (user_id FK) */
export function useUserRole(userId) {
  const [state, setState] = useState({ loading: !!userId, role: null });

  useEffect(() => {
    let cancelled = false;
    if (!userId) {
      setState({ loading: false, role: null });
      return;
    }

    setState({ loading: true, role: null });

    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("useUserRole error:", error.message);
          setState({ loading: false, role: null });
        } else {
          setState({ loading: false, role: data?.role || "user" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state; // { loading, role }
}

export function isModOrAdmin(role) {
  return role === "mod" || role === "admin";
}
