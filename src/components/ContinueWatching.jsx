"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import Link from "next/link";

export default function ContinueWatching() {
  const { user } = useAuth();
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        // Vai à coleção: users -> UID -> progress
        // Ordena por 'updatedAt' (mais recentes primeiro)
        const q = query(
          collection(db, "users", user.uid, "progress"), 
          orderBy("updatedAt", "desc"), 
          limit(10)
        );
        
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filtra só os que têm progresso significativo (>5%) e não acabaram (<90%)
        const validItems = items.filter(i => i.percentage > 5 && i.percentage < 90);
        
        // Aqui teríamos de cruzar com o TMDB para ter as imagens, 
        // mas para simplificar vamos assumir que guardamos a imagem no futuro.
        // Por agora, este componente fica "preparado" mas pode não mostrar imagens se não as guardaste.
        setProgressItems(validItems);
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [user]);

  if (loading || progressItems.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
        Continuar a Ver
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {progressItems.map((item) => (
          <Link 
            key={item.mediaId} 
            href={`/watch/movie/${item.mediaId}`} // Assume filmes por agora
            className="flex-shrink-0 w-64 group relative"
          >
            {/* Como não guardamos a imagem no progress.js ainda, usamos um placeholder ou terias de fazer fetch ao TMDB aqui */}
            <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Filme {item.mediaId}</span>
              
              {/* Barra de Progresso */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-700">
                <div 
                  className="h-full bg-purple-500" 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}