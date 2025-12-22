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
  const [myList, setMyList] = useState([]); 
  const [debugMsg, setDebugMsg] = useState(null); // Para vermos o que se passa

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 1. Continuar a ver
        const progressItems = await listContinueWatching(10);
        if (progressItems) setContinueList(progressItems);

        // 2. Minha Lista
        const { data: listRows, error } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error(error);
          return;
        }

        if (listRows && listRows.length > 0) {
          const enrichedList = await Promise.all(listRows.map(async (row) => {
             try {
               // Mapeia "movie" -> movie, tudo o resto -> tv
               const type = row.item_type === 'movie' ? 'movie' : 'tv';
               const res = await fetch(`https://api.themoviedb.org/3/${type}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`);
               if (!res.ok) return null;
               const tmdb = await res.json();
               return { ...tmdb, item_type: type }; 
             } catch(e) { return null; }
          }));
          
          setMyList(enrichedList.filter(i => i !== null));
        } else {
          setDebugMsg("A tua lista está vazia na Base de Dados.");
        }
      }
    }
    load();
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden bg-black">
      <HeroSection />

      <div className="relative z-20 -mt-10 space-y-2">
        
        {/* Continuar a ver */}
        {continueList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {/* Minha Lista */}
        {myList.length > 0 ? (
          <MediaRow title="📂 A Minha Lista" itemsProp={myList} />
        ) : (
          /* Só aparece se estivermos a testar e não houver lista */
          debugMsg && (
            <div className="px-6 text-gray-500 text-xs mb-4">
              Info: {debugMsg} (Adiciona um filme para aparecer aqui o carrossel)
            </div>
          )
        )}

        {/* Resto */}
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