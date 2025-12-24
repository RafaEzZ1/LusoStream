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

    async function checkSession() {
      try {
        console.log("🕵️ [AuthProvider] Iniciando verificação de sessão (getSession)...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
          if (session?.user) {
            console.log("✅ [AuthProvider] Sessão encontrada para:", session.user.email);
            setUser(session.user);
            
            // Tentar ler Role
            const { data } = await supabase.from("profiles").select("role").eq("user_id", session.user.id).maybeSingle();
            setRole(data?.role || "user");
          } else {
            console.warn("⚠️ [AuthProvider] Nenhuma sessão ativa.");
            setUser(null);
            setRole(null);
          }
        }
      } catch (e) {
        console.error("❌ [AuthProvider] Erro Fatal:", e);
      } finally {
        if (mounted) {
          console.log("🔓 [AuthProvider] Loading definido para FALSE. O site deve desbloquear.");
          setLoading(false);
        }
      }
    }

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 [AuthProvider] Mudança de Estado: ${event}`);
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
    console.log("👋 [AuthProvider] A sair...");
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth";
  };

  // DEBUG VISUAL: Se estiver bloqueado, mostra isto no ecrã
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent mb-4"></div>
        <p className="text-xl font-bold">A carregar sistema de login...</p>
        <p className="text-sm text-gray-500 mt-2">Verifica a consola (F12) se isto demorar muito.</p>
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
}