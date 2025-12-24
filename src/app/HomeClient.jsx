// src/app/HomeClient.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // <--- Novo Import
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const [continueList, setContinueList] = useState([]);
  const [myList, setMyList] = useState([]); 
  
  // Criar o cliente aqui
  const supabase = createClient();

  useEffect(() => {
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Carregar "Continuar a Ver"
        const progressItems = await listContinueWatching(10);
        if (progressItems) setContinueList(progressItems);

        // Carregar "Minha Lista"
        const { data: listRows } = await supabase
          .from("watchlists")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (listRows && listRows.length > 0) {
          const enrichedList = await Promise.all(listRows.map(async (row) => {
              try {
                const apiType = (row.item_type === 'movie') ? 'movie' : 'tv';
                const res = await fetch(`https://api.themoviedb.org/3/${apiType}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`);
                const tmdb = await res.json();
                if (!tmdb.id) return null;
                return { ...tmdb, item_type: apiType }; 
              } catch(e) { return null; }
          }));
          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="pb-24 overflow-x-hidden bg-black">
      <HeroSection />

      <div className="relative z-20 -mt-10 space-y-2">
        {continueList.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <ContinueWatching items={continueList} />
          </div>
        )}

        {myList.length > 0 && (
          <MediaRow title="📂 A Minha Lista" itemsProp={myList} />
        )}

        <MediaRow title="🔥 Filmes em Alta" endpoint="trending/movie/week?" type="movie" />
        <MediaRow title="📺 Séries do Momento" endpoint="trending/tv/week?" type="tv" />
        <MediaRow title="🎬 Ação & Aventura" endpoint="discover/movie?with_genres=28,12&sort_by=popularity.desc" type="movie" />
        <MediaRow title="😂 Comédia" endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" type="movie" />
        <MediaRow title="🐉 Animação & Anime" endpoint="discover/tv?with_genres=16&sort_by=popularity.desc" type="tv" />
        
        <div className="px-6 mt-16 mb-8 max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4 flex items-center gap-2">
            Não encontraste o que procuras?
            <span className="text-gray-500 text-sm font-normal hidden sm:inline-block">Explora as nossas bibliotecas completas:</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/movies" className="group relative h-40 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 hover:border-red-600 transition duration-300 shadow-lg hover:shadow-red-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-black group-hover:from-red-800/60 transition"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-white group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                <span className="text-xl font-bold text-white uppercase tracking-wider">Ver Filmes</span>
              </div>
            </Link>

            <Link href="/series" className="group relative h-40 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 hover:border-blue-600 transition duration-300 shadow-lg hover:shadow-blue-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black group-hover:from-blue-800/60 transition"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-white group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-xl font-bold text-white uppercase tracking-wider">Ver Séries</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}