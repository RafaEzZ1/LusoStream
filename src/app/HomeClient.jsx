// src/app/HomeClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
// 👇 IMPORTAR A FUNÇÃO CORRETA
import { listContinueWatching } from "@/lib/progress";

export default function HomeClient() {
  const [continueList, setContinueList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar "Continuar a Ver"
  useEffect(() => {
    async function load() {
      // 1. Verificar Utilizador
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // 2. Usar a função de progresso corrigida
      const items = await listContinueWatching(10);
      
      // 3. Buscar detalhes ao TMDB para cada item (para termos as imagens bonitas)
      // A listContinueWatching devolve apenas IDs, precisamos de "enriquecer" os dados
      // Nota: O componente ContinueWatching já faz fetch das imagens se passarmos o ID, 
      // mas vamos garantir que a lista está limpa.
      if (items && items.length > 0) {
        setContinueList(items);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden">
      
      {/* 1. Destaque Gigante */}
      <HeroSection />

      <div className="relative z-10 -mt-24 space-y-2">
        
        {/* 2. Continuar a ver (Com proteção para não rebentar se estiver vazio) */}
        {continueList.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {/* 3. Filmes Populares */}
        <MediaRow title="🔥 Filmes em Alta" endpoint="trending/movie/week?" type="movie" />
        <MediaRow title="📺 Séries do Momento" endpoint="trending/tv/week?" type="tv" />
        <MediaRow title="🎬 Ação & Aventura" endpoint="discover/movie?with_genres=28,12&sort_by=popularity.desc" type="movie" />
        <MediaRow title="👻 Terror & Suspense" endpoint="discover/movie?with_genres=27,53&sort_by=popularity.desc" type="movie" />
        <MediaRow title="😂 Comédia" endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" type="movie" />
        <MediaRow title="🐉 Animação & Anime" endpoint="discover/tv?with_genres=16&sort_by=popularity.desc" type="tv" />
        <MediaRow title="⭐ Mais Votados" endpoint="movie/top_rated?" type="movie" />
      </div>
    </main>
  );
}