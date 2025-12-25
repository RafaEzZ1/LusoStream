"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider"; // Usa o contexto Firebase
import HeroSection from "@/components/HeroSection";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const { user, profile } = useAuth(); // Perfil já traz a watchlist
  const [continueList, setContinueList] = useState([]);
  const [myList, setMyList] = useState([]); 

  useEffect(() => {
    async function loadContent() {
      if (user) {
        // 1. Carregar Continuar a Ver
        const progressItems = await listContinueWatching(user.uid);
        setContinueList(progressItems);

        // 2. Carregar Minha Lista (baseada no array do perfil)
        if (profile?.watchlist?.length > 0) {
          const enrichedList = await Promise.all(profile.watchlist.map(async (id) => {
              try {
                // Tenta buscar como filme primeiro
                let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
                if (!res.ok) {
                   // Se falhar, tenta como série
                   res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`);
                }
                const tmdb = await res.json();
                if (!tmdb.id) return null;
                return tmdb;
              } catch(e) { return null; }
          }));
          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    }
    loadContent();
  }, [user, profile]);

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
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/movies" className="group relative h-40 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 hover:border-red-600 transition duration-300 shadow-lg hover:shadow-red-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-black group-hover:from-red-800/60 transition"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-xl font-bold text-white uppercase tracking-wider">Ver Filmes</span>
              </div>
            </Link>

            <Link href="/series" className="group relative h-40 rounded-xl overflow-hidden flex items-center justify-center border border-gray-800 hover:border-blue-600 transition duration-300 shadow-lg hover:shadow-blue-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-black group-hover:from-blue-800/60 transition"></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-xl font-bold text-white uppercase tracking-wider">Ver Séries</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}