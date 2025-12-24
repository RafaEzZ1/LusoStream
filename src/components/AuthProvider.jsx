"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Criar o cliente APENAS UMA VEZ dentro do componente para evitar erros de renderização
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Verificar sessão atual
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Erro Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. Ouvir mudanças (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/auth";
  };

  // Enquanto carrega, mostramos um ecrã preto simples para não dar erro de hidratação
  if (loading) {
    return <div className="bg-black min-h-screen w-full" />;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}