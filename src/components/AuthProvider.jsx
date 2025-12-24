// src/components/AuthProvider.jsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const AuthCtx = createContext({ user: null, role: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  async function hydrate() {
    try {
      // 1. Verificar Sessão
      const { data: sess } = await supabase.auth.getSession();
      const u = sess?.session?.user || null;
      setUser(u);

      // 2. Se tiver user, buscar Role (com segurança)
      if (u) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", u.id)
          .maybeSingle();
        
        if (!error && data) {
          setRole(data.role);
        } else {
          setRole("user"); // Fallback seguro
        }
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error("Erro Auth:", err);
      // Em caso de erro grave, assumimos user deslogado para o site abrir
      setUser(null);
      setRole(null);
    } finally {
      // 3. OBRIGATÓRIO: Desligar o loading aconteça o que acontecer
      setLoading(false);
    }
  }

  useEffect(() => {
    hydrate();

    // Escutar mudanças em tempo real
    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      const u = session?.user || null;
      setUser(u);
      
      if (u) {
        // Fetch role rápido
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
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function signOut() {
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
    setRole(null);
    window.location.assign("/auth"); // Refresh completo para limpar memória
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