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
      // 1. Obter sessão dos Cookies (agora funciona graças ao novo supabaseClient)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // 2. Buscar Role
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", currentUser.id)
          .maybeSingle();
        
        setRole(data?.role || "user");
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Erro na Auth:", error);
      setUser(null);
      setRole(null);
    } finally {
      // 3. OBRIGATÓRIO: Desliga o loading aconteça o que acontecer
      setLoading(false);
    }
  }

  useEffect(() => {
    hydrate();

    // Escutar mudanças em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", currentUser.id)
          .maybeSingle();
        setRole(data?.role || "user");
      } else {
        setRole(null);
      }
      setLoading(false); 
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    window.location.href = "/auth";
  };

  return (
    <AuthCtx.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}