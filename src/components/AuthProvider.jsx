// src/components/AuthProvider.jsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, getUserData, createUserProfile, firebaseSignOut } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Dados do Auth (Email, UID)
  const [profile, setProfile] = useState(null); // Dados da BD (Role, Watchlist)
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ouve mudanças de login em tempo real (WebSockets do Firebase)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Garante que o utilizador existe na BD
        await createUserProfile(currentUser);
        
        // Vai buscar o role e a watchlist
        const data = await getUserData(currentUser.uid);
        setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/auth");
    router.refresh();
  };

  // Verifica se é Admin
  const isAdmin = profile?.role === 'admin';

  if (loading) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white">A carregar LusoStream...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}