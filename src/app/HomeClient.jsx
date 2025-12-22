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
  const [myList, setMyList] = useState([]); // Estado para a Minha Lista

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 1. Carregar "Continuar a Ver"
        const progressItems = await listContinueWatching(10);
        if (progressItems) setContinueList(progressItems);

        // 2. Carregar "Minha Lista" (Favoritos)
        const { data: listRows } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (listRows && listRows.length > 0) {
          // Precisamos de ir buscar as imagens e títulos ao TMDB
          // porque a base de dados só tem o ID.
          const enrichedList = await Promise.all(listRows.map(async (row) => {
             try {
               const type = row.item_type === 'movie' ? 'movie' : 'tv';
               const res = await fetch(`https://api.themoviedb.org/3/${type}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`);
               const tmdb = await res.json();
               // Juntamos os dados do TMDB com o tipo correto para o link funcionar
               return { ...tmdb, item_type: row.item_type }; 
             } catch(e) { return null; }
          }));
          
          // Filtramos possíveis erros (nulls) e guardamos no estado
          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    }
    load();
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden bg-black">
      
      {/* 1. DESTAQUE GIGANTE (Topo) */}
      <HeroSection />

      {/* Margem negativa (-mt-10) para os carrosséis subirem um pouco para cima do Destaque */}
      <div className="relative z-20 -mt-10 space-y-2">
        
        {/* 2. CONTINUAR A VER (Primeira Fila) */}
        {continueList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {/* 3. A MINHA LISTA (Segunda Fila - Exatamente onde pediste) */}
        {myList.length > 0 && (
          <MediaRow 
            title="📂 A Minha Lista" 
            itemsProp={myList} // Passamos a lista manualmente
          />
        )}

        {/* 4. RESTO DOS CARROSSÉIS */}
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