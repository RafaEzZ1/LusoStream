"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** 1. Hook Base: Deteta sessão */
export function useAuthUser() {
  const [state, setState] = useState({ loading: true, user: null, session: null });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({ loading: false, user: data?.session?.user || null, session: data?.session || null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ loading: false, user: session?.user || null, session: session || null });
    });
    return () => { mounted = false; sub?.subscription?.unsubscribe?.(); };
  }, []);
  return state;
}

/** 2. Hook Role: Busca permissão */
export function useUserRole(userId) {
  const [state, setState] = useState({ loading: !!userId, role: null });

  useEffect(() => {
    let cancelled = false;
    if (!userId) { setState({ loading: false, role: null }); return; }
    setState({ loading: true, role: null });
    supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle()
      .then(({ data }) => { if (!cancelled) setState({ loading: false, role: data?.role || "user" }); });
    return () => { cancelled = true; };
  }, [userId]);
  return state;
}

/** 3. Hook Combinado (CORREÇÃO DE BUILD): O Navbar precisa disto */
export function useAuthRole() {
  const { user, loading: userLoading } = useAuthUser();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    if (!user) { setRole(null); setRoleLoading(false); return; }

    supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        setRole(data?.role || "user");
        setRoleLoading(false);
      });
  }, [user, userLoading]);

  return { user, role, loading: userLoading || roleLoading };
}

export function isModOrAdmin(role) { return role === "mod" || role === "admin"; }