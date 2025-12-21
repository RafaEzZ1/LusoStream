// src/hooks/useAuthRole.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** 1. Hook Base: Deteta sessão e login/logout */
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

    // 2) subscrever a eventos
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

/** 2. Hook Role: Busca permissão de um user ID */
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

/** * 3. Hook Principal (ESTE FALTAVA): 
 * Combina User + Role para o Navbar usar
 */
export function useAuthRole() {
  const { user, loading: userLoading } = useAuthUser();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setRole(null);
      setRoleLoading(false);
      return;
    }

    // Se temos user, vamos buscar a role
    supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setRole(data?.role || "user");
        setRoleLoading(false);
      });
      
  }, [user, userLoading]);

  return { 
    user, 
    role, 
    loading: userLoading || roleLoading 
  };
}

export function isModOrAdmin(role) {
  return role === "mod" || role === "admin";
}