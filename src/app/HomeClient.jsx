"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ContinueWatching from "@/components/ContinueWatching"; // Vamos criar este a seguir
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

// Função para buscar imagem e nome ao TMDB
async function fetchDetails(id, type) {
  try {
    const endpoint = type === 'tv' || type === 'series' ? 'tv' : 'movie';
    const res = await fetch(`https://api.themoviedb.org/3/${endpoint}/${id}?api_key=${API_KEY}&language=pt-BR`);
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

export default function HomeClient() {
  const { user, profile } = useAuth();
  const [continueList, setContinueList] = useState([]);
  const [myList, setMyList] = useState([]); 
  const [featuredMovie, setFeaturedMovie] = useState(null);

  useEffect(() => {
    async function loadContent() {
      // 1. Banner Principal
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        if (data.results?.length) {
          setFeaturedMovie(data.results[Math.floor(Math.random() * 5)]); // Escolhe um dos top 5
        }
      } catch (e) { console.error(e); }

      if (user) {
        // 2. Carregar "Continuar a Ver"
        try {
          const progressItems = await listContinueWatching(user.uid);
          
          if (progressItems.length > 0) {
            // Vai buscar as imagens ao TMDB para cada item
            const enriched = await Promise.all(progressItems.map(async (item) => {
              const details = await fetchDetails(item.mediaId, item.mediaType);
              if (!details) return null;
              return {
                ...item, // Dados do progresso (percentagem, segundos)
                ...details, // Dados visuais (imagem, titulo)
                uniqueId: item.mediaId // Garantia de ID
              };
            }));
            setContinueList(enriched.filter(i => i !== null));
          }
        } catch(e) { console.error("Erro home progress:", e); }

        // 3. Carregar Minha Lista
        if (profile?.watchlist?.length > 0) {
          const enrichedList = await Promise.all(profile.watchlist.map(async (id) => {
              const movie = await fetchDetails(id, 'movie');
              if (movie) return { ...movie, item_type: 'movie' };
              const show = await fetchDetails(id, 'tv');
              if (show) return { ...show, item_type: 'tv' };
              return null;
          }));
          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    }
    loadContent();
  }, [user, profile]);

  return (
    <div className="bg-black min-h-screen pb-20 overflow-x-hidden">
      
      {/* Banner Hero */}
      <div className="relative h-[80vh] w-full -mt-20">
        {featuredMovie && (
          <>
            <div className="absolute inset-0">
              <img 
                src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`} 
                className="w-full h-full object-cover opacity-60"
                alt={featuredMovie.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 p-8 md:p-16 w-full max-w-3xl z-10 space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-xl">
                {featuredMovie.title || featuredMovie.name}
              </h1>
              <p className="text-gray-200 text-lg line-clamp-3 drop-shadow-md">
                {featuredMovie.overview}
              </p>
              <div className="flex gap-4 pt-4">
                <Link href={`/movies/${featuredMovie.id}`} className="bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2">
                   Reproduzir
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="relative z-20 px-4 md:px-12 space-y-10 -mt-20">
        
        {/* --- AQUI ESTÁ O NOVO COMPONENTE --- */}
        {continueList.length > 0 && (
          <ContinueWatching items={continueList} />
        )}

        {myList.length > 0 && <MediaRow title="📂 A Minha Lista" itemsProp={myList} />}
        <MediaRow title="🔥 Tendências" endpoint="trending/all/week?" type="movie" />
        <MediaRow title="🎬 Filmes de Ação" endpoint="discover/movie?with_genres=28&sort_by=popularity.desc" type="movie" />
        <MediaRow title="📺 Séries Populares" endpoint="trending/tv/week?" type="tv" />
      </div>
    </div>
  );
}