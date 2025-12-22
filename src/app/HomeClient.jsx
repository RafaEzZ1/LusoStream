// src/app/HomeClient.jsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const [continueList, setContinueList] = useState([]);
  const [myList, setMyList] = useState([]); // Nova lista para favoritos

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 1. Carregar Continuar a Ver
        const progressItems = await listContinueWatching(10);
        if (progressItems) setContinueList(progressItems);

        // 2. Carregar Minha Lista (Watchlist) para a Home
        const { data: listRows } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(15);

        if (listRows && listRows.length > 0) {
          // Precisamos buscar os detalhes ao TMDB para ter as imagens
          const enrichedList = await Promise.all(listRows.map(async (row) => {
             try {
               const type = row.item_type === 'movie' ? 'movie' : 'tv';
               const res = await fetch(`https://api.themoviedb.org/3/${type}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`);
               const tmdb = await res.json();
               return { ...tmdb, item_type: row.item_type }; // Importante para o link funcionar
             } catch(e) { return null; }
          }));
          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    }
    load();
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden bg-black">
      
      {/* 1. Destaque Gigante */}
      <HeroSection />

      {/* 2. Conteúdo Principal */}
      {/* Mudei de -mt-24 para -mt-10 para não tapar tanto. z-20 garante que é clicável */}
      <div className="relative z-20 -mt-10 space-y-2">
        
        {/* Continuar a ver */}
        {continueList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {/* 👇 NOVA SECÇÃO: MINHA LISTA NA HOME */}
        {myList.length > 0 && (
          <MediaRow 
            title="📂 A Minha Lista" 
            itemsProp={myList} // Passamos os itens diretamente
          />
        )}

        {/* Filas Normais */}
        <MediaRow title="🔥 Filmes em Alta" endpoint="trending/movie/week?" type="movie" />
        <MediaRow title="📺 Séries do Momento" endpoint="trending/tv/week?" type="tv" />
        <MediaRow title="🎬 Ação & Aventura" endpoint="discover/movie?with_genres=28,12&sort_by=popularity.desc" type="movie" />
        <MediaRow title="👻 Terror & Suspense" endpoint="discover/movie?with_genres=27,53&sort_by=popularity.desc" type="movie" />
        <MediaRow title="😂 Comédia" endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" type="movie" />
        <MediaRow title="🐉 Animação & Anime" endpoint="discover/tv?with_genres=16&sort_by=popularity.desc" type="tv" />
      </div>
    </main>
  );
}