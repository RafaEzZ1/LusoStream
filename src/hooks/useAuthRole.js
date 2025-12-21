"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** 1. Hook Base: Deteta sessão e login/logout em tempo real */
export function useAuthUser() {
  const [state, setState] = useState({
    loading: true,
    user: null,
    session: null,
  });

  useEffect(() => {
    let mounted = true;

    // Ler sessão inicial
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({
        loading: false,
        user: data?.session?.user || null,
        session: data?.session || null,
      });
    });

    // Escutar mudanças (Login, Logout, etc)
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

/** 2. Hook Auxiliar: Busca a role de um ID específico */
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
        setState({ loading: false, role: data?.role || "user" });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return state;
}

/** * 3. Hook Principal (O que o Navbar usa): 
 * Junta o User e a Role numa só chamada.
 */
export function useAuthRole() {
  const { user, loading: userLoading } = useAuthUser();
  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return; // Espera que o user carregue

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