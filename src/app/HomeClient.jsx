"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";
import { FaPlay, FaInfoCircle, FaFilm, FaTv } from "react-icons/fa";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

// Função auxiliar para buscar detalhes
async function fetchDetails(id, type) {
  try {
    // Normaliza: se for 'series' vira 'tv'
    const endpoint = (type === 'tv' || type === 'series') ? 'tv' : 'movie';
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
  
  // Estado para categoria sazonal
  const [isChristmas, setIsChristmas] = useState(false);

  useEffect(() => {
    // Verificar se é época de Natal (Mês 11 ou 12)
    const month = new Date().getMonth();
    if (month === 11 || month === 0) setIsChristmas(true); // Dezembro (11) ou Janeiro (0)

    async function loadContent() {
      // 1. Destaque (Aleatório dos Trending)
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        if (data.results?.length) {
          setFeaturedMovie(data.results[Math.floor(Math.random() * 5)]);
        }
      } catch (e) { console.error(e); }

      if (user) {
        // 2. Carregar "Continuar a Ver"
        try {
          const progressItems = await listContinueWatching(user.uid);
          
          if (progressItems.length > 0) {
            const enriched = await Promise.all(progressItems.map(async (item) => {
              const details = await fetchDetails(item.mediaId, item.mediaType);
              if (!details) return null;
              return {
                ...item,
                ...details, 
                uniqueId: item.mediaId 
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
    <div className="bg-black min-h-screen pb-20 overflow-x-hidden font-sans">
      
      {/* --- HERO SECTION (Destaque) --- */}
      <div className="relative h-[85vh] w-full -mt-24">
        {featuredMovie && (
          <>
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 z-0">
              <img 
                src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`} 
                className="w-full h-full object-cover opacity-60"
                alt={featuredMovie.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-transparent to-transparent" />
            </div>

            {/* Conteúdo do Destaque */}
            <div className="absolute bottom-0 left-0 p-6 md:p-16 w-full max-w-3xl z-10 flex flex-col justify-end h-full pb-24 md:pb-32">
              <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-2xl mb-4 leading-tight">
                {featuredMovie.title || featuredMovie.name}
              </h1>
              <p className="text-gray-200 text-lg line-clamp-3 drop-shadow-md mb-8 max-w-2xl">
                {featuredMovie.overview}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link 
                  href={`/watch/movie/${featuredMovie.id}`} 
                  className="bg-white text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition flex items-center gap-3 shadow-lg hover:scale-105 transform duration-200"
                >
                  <FaPlay /> Reproduzir
                </Link>
                <Link 
                  href={`/movies/${featuredMovie.id}`} 
                  className="bg-gray-600/60 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-600/80 backdrop-blur-md transition flex items-center gap-3 border border-white/20"
                >
                  <FaInfoCircle /> Mais Info
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- LISTAS DE CONTEÚDO --- */}
      {/* Ajustei o margin-top e o z-index para não bater no Hero */}
      <div className="relative z-20 px-4 md:px-12 space-y-2 -mt-12 bg-gradient-to-t from-black via-black to-transparent pt-10">
        
        {/* 1. Continuar a Ver (Se existir) */}
        {continueList.length > 0 && (
          <ContinueWatching items={continueList} />
        )}

        {/* 2. Minha Lista (Se existir) */}
        {myList.length > 0 && <MediaRow title="📂 A Minha Lista" itemsProp={myList} />}

        {/* 3. Categoria Sazonal (Natal) */}
        {isChristmas && (
          <MediaRow 
            title="🎄 Especial de Natal" 
            endpoint="discover/movie?with_keywords=207317&sort_by=popularity.desc" 
            type="movie" 
          />
        )}

        <MediaRow title="🔥 Filmes em Alta" endpoint="trending/movie/week?" type="movie" />
        <MediaRow title="📺 Séries do Momento" endpoint="trending/tv/week?" type="tv" />
        <MediaRow title="🎬 Ação Pura" endpoint="discover/movie?with_genres=28&sort_by=popularity.desc" type="movie" />
        <MediaRow title="😂 Comédia" endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" type="movie" />
        
        {/* --- BOTÕES FINAIS PARA O CATÁLOGO --- */}
        <div className="py-20 flex flex-col md:flex-row gap-6 justify-center items-center border-t border-white/5 mt-12">
          <Link 
            href="/movies"
            className="group w-full md:w-auto bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-800 hover:border-purple-500 transition-all duration-300 flex flex-col items-center text-center gap-4 min-w-[300px]"
          >
            <div className="bg-purple-600/20 p-4 rounded-full group-hover:bg-purple-600 transition duration-300">
              <FaFilm className="text-3xl text-purple-500 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Ver Todos os Filmes</h3>
              <p className="text-gray-400 text-sm mt-1">Explora o nosso catálogo completo</p>
            </div>
          </Link>

          <Link 
            href="/series"
            className="group w-full md:w-auto bg-zinc-900 border border-zinc-800 p-8 rounded-2xl hover:bg-zinc-800 hover:border-blue-500 transition-all duration-300 flex flex-col items-center text-center gap-4 min-w-[300px]"
          >
            <div className="bg-blue-600/20 p-4 rounded-full group-hover:bg-blue-600 transition duration-300">
              <FaTv className="text-3xl text-blue-500 group-hover:text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Ver Todas as Séries</h3>
              <p className="text-gray-400 text-sm mt-1">Maratonas infinitas esperam por ti</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}