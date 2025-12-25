"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🕵️ [Auth] A tentar ligar ao Supabase...");
        
        // Timeout de Segurança: Se o Supabase não responder em 1.5s, abrimos o site na mesma
        const timeoutPromise = new Promise((resolve) => setTimeout(() => {
             console.warn("⚠️ [Auth] Demorou muito. A forçar abertura.");
             resolve({ data: { session: null }, error: "timeout" });
        }, 10000));

        const sessionPromise = supabase.auth.getSession();

        // Quem chegar primeiro ganha (Supabase ou o Timeout)
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (mounted) {
          if (session) {
             console.log("✅ [Auth] Sessão encontrada:", session.user.email);
             setUser(session.user);
          } else {
             console.log("👤 [Auth] Visitante (ou timeout).");
          }
        }
      } catch (error) {
        console.error("❌ [Auth] Erro Crítico:", error);
      } finally {
        if (mounted) {
            console.log("🔓 [Auth] A desbloquear ecrã...");
            setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false); // Garante que desbloqueia ao mudar de estado
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Se estiver a carregar, mostra preto, mas agora temos a garantia que desaparece em 1.5s
  if (loading) {
    return (
        <div className="bg-black min-h-screen w-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signOut: async () => await supabase.auth.signOut() }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}