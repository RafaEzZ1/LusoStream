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

    async function initAuth() {
      try {
        console.log("🚀 [Auth] A iniciar...");
        
        // 1. Obter Sessão (Rápido)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            console.log("✅ [Auth] Sessão encontrada.");
            setUser(session.user);
            
            // 2. Buscar Role com TIMEOUT (Para não bloquear o site)
            // Se a base de dados não responder em 2 segundos, avança.
            const rolePromise = supabase
              .from("profiles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();
              
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 2000));

            const result = await Promise.race([rolePromise, timeoutPromise]);

            if (result.timeout) {
              console.warn("⚠️ [Auth] A base de dados demorou muito. A ignorar perfil.");
              setRole("user"); // Assume utilizador normal para não bloquear
            } else if (result.data) {
              setRole(result.data.role);
            } else {
              setRole("user");
            }
          } else {
            console.log("⚪ [Auth] Visitante.");
            setUser(null);
            setRole(null);
          }
        }
      } catch (e) {
        console.error("❌ [Auth] Erro:", e);
      } finally {
        if (mounted) {
          console.log("🔓 [Auth] Desbloqueando UI.");
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 [Auth] Evento: ${event}`);
      if (!mounted) return;
      
      const u = session?.user || null;
      setUser(u);
      
      // Se for login, tenta buscar a role rapidamente
      if (u) {
         // Lógica simplificada para updates de estado
         // Não bloqueamos aqui, deixamos carregar em background se necessário
         supabase.from("profiles").select("role").eq("user_id", u.id).maybeSingle()
           .then(({ data }) => { if (mounted) setRole(data?.role || "user"); });
      } else {
        setRole(null);
      }
      
      // Garante que o loading desaparece sempre
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    window.location.href = "/auth";
  };

  // DEBUG VISUAL: Só mostra isto se demorar mesmo muito
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}a