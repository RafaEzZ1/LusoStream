// src/hooks/useAuthRole.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** * 1. Hook Simples: Só busca o User (Sessão)
 */
export function useAuthUser() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    session: null,
  });

  useEffect(() => {
    let mounted = true;

    // ler sessão atual
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        loading: false,
        user: data?.session?.user || null,
        session: data?.session || null,
      });
    });

    // subscrever a eventos
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

  return state;
}

/** * 2. Hook Específico: Busca a role dado um ID
 */
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

  return state;
}

/**
 * 3. Hook Combinado (O QUE FALTAVA): Busca User + Role automaticamente
 * É este que o Navbar está a tentar usar!
 */
export function useAuthRole() {
  const [state, setState] = useState({ 
    user: null, 
    role: null, 
    loading: true 
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      // 1. Pega no user
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;

      if (!user) {
        if (mounted) setState({ user: null, role: null, loading: false });
        return;
      }

      // 2. Pega na role
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (mounted) {
        setState({
          user,
          role: data?.role || "user",
          loading: false
        });
      }
    }

    load();
  }, []);

  return state;
}

export function isModOrAdmin(role) {
  return role === "mod" || role === "admin";
}