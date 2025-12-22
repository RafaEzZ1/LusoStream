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

  useEffect(() => {
    // Escutar o login em tempo real para garantir que carregamos a lista no momento certo
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      
      if (session?.user) {
        // 1. Carregar "Continuar a Ver"
        const progressItems = await listContinueWatching(10);
        if (progressItems) setContinueList(progressItems);

        // 2. Carregar "Minha Lista"
        const { data: listRows } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (listRows && listRows.length > 0) {
          const enrichedList = await Promise.all(listRows.map(async (row) => {
              try {
                // Converter tipo para o que a API entende
                const apiType = (row.item_type === 'movie') ? 'movie' : 'tv';
                
                const res = await fetch(`https://api.themoviedb.org/3/${apiType}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`);
                const tmdb = await res.json();
                
                if (!tmdb.id) return null;

                return { ...tmdb, item_type: apiType }; 
              } catch(e) { 
                return null; 
              }
          }));

          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden bg-black">
      
      {/* 1. DESTAQUE GIGANTE */}
      <HeroSection />

      <div className="relative z-20 -mt-10 space-y-2">
        
        {/* 2. CONTINUAR A VER */}
        {continueList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {/* 3. A MINHA LISTA */}
        {myList.length > 0 && (
          <MediaRow title="📂 A Minha Lista" itemsProp={myList} />
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