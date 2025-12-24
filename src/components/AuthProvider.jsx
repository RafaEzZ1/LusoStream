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

    async function getSession() {
      try {
        // MUDANÇA: getSession é instantâneo e evita o "logout fantasma"
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            const { data } = await supabase
              .from("profiles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();
            setRole(data?.role || "user");
          } else {
            setUser(null);
            setRole(null);
          }
        }
      } catch (e) {
        console.error("Auth Error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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