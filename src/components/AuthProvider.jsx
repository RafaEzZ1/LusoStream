"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase"; // Importa 'db' aqui
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore"; // Importa 'onSnapshot'
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // 1. Garante que o perfil existe
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
           await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || "Sem Nome",
            role: "user",
            watchlist: [],
            createdAt: new Date()
          });
        }

        // 2. OUVE MUDANÇAS EM TEMPO REAL (Isto resolve o problema do F5!)
        unsubscribeProfile = onSnapshot(userRef, (doc) => {
          setProfile(doc.data());
        });

      } else {
        setUser(null);
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile(); // Para de ouvir se sair
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signOut = async () => {
    await auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  const isAdmin = profile?.role === 'admin';

  if (loading) {
    return <div className="bg-black min-h-screen flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
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