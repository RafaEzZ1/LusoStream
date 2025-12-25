"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Cria o cliente uma única vez
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Estado Auth Mudou:", event);
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
        
        // Se houve erro de token, forçar logout visual
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            setUser(null);
            router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Função simples de SignOut
  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    router.push("/auth"); // Redireciona para login
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, signOut, loading }}>
      {!loading ? (
        children
      ) : (
        // Loader Simples enquanto verifica a sessão inicial
        <div className="bg-black min-h-screen w-full flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
                <p className="text-sm text-gray-400">A conectar...</p>
            </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}