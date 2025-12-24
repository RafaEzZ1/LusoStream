"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthCtx = createContext({ user: null, role: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        console.log("🔐 AuthProvider: A verificar sessão...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("❌ Erro grave no Supabase:", error.message);
          throw error;
        }

        if (mounted) {
          if (session?.user) {
            console.log("✅ Utilizador encontrado:", session.user.email);
            setUser(session.user);
            
            // Buscar Role
            const { data, error: profileError } = await supabase
              .from("profiles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();
            
            if (profileError) console.error("⚠️ Erro ao ler perfil:", profileError.message);
            
            setRole(data?.role || "user");
          } else {
            console.warn("⚠️ Nenhuma sessão ativa encontrada.");
            setUser(null);
            setRole(null);
          }
        }
      } catch (e) {
        console.error("❌ CRASH Auth:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkUser();

    // Ouvir mudanças (Login, Logout, Token Expirado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Evento Auth Disparado: ${event}`);
      
      if (!mounted) return;
      const u = session?.user || null;
      setUser(u);
      
      if (u) {
        const { data } = await supabase.from("profiles").select("role").eq("user_id", u.id).maybeSingle();
        setRole(data?.role || "user");
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("👋 A sair...");
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