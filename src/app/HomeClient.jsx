"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ContinueWatching from "@/components/ContinueWatching";
import MediaRow from "@/components/MediaRow";
import { listContinueWatching } from "@/lib/progress";

// Se tiveres o componente Hero separado, importa-o. 
// Se não, vou assumir que o Hero faz parte deste código ou usas uma imagem de destaque manual.
// Para garantir que funciona, vou pôr aqui um Hero "in-line" simples e bonito.

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const { user, profile } = useAuth();
  const [continueList, setContinueList] = useState([]);
  const [myList, setMyList] = useState([]); 
  const [featuredMovie, setFeaturedMovie] = useState(null);

  // 1. Carregar Dados Iniciais
  useEffect(() => {
    async function loadContent() {
      // Buscar filme de destaque aleatório
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=pt-BR`);
        const data = await res.json();
        const random = data.results[Math.floor(Math.random() * data.results.length)];
        setFeaturedMovie(random);
      } catch (e) { console.error(e); }

      if (user) {
        // Carregar "Continuar a Ver"
        const progressItems = await listContinueWatching(user.uid);
        setContinueList(progressItems);

        // Carregar Minha Lista
        if (profile?.watchlist?.length > 0) {
          const enrichedList = await Promise.all(profile.watchlist.map(async (id) => {
              try {
                let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
                if (!res.ok) res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`);
                const tmdb = await res.json();
                return tmdb.id ? tmdb : null;
              } catch(e) { return null; }
          }));
          setMyList(enrichedList.filter(i => i !== null));
        }
      }
    }
    loadContent();
  }, [user, profile]);

  return (
    <div className="bg-black min-h-screen pb-20 overflow-x-hidden">
      
      {/* --- HERO SECTION (Destaque) --- */}
      {/* Nota: mt-[-80px] serve para a imagem subir e ficar atrás da Navbar transparente */}
      <div className="relative h-[85vh] w-full -mt-20">
        {featuredMovie && (
          <>
            <div className="absolute inset-0">
              <img 
                src={`https://image.tmdb.org/t/p/original${featuredMovie.backdrop_path}`} 
                className="w-full h-full object-cover opacity-70"
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
                <Link 
                  href={`/movies/${featuredMovie.id}`} 
                  className="bg-white text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Reproduzir
                </Link>
                <Link 
                  href={`/movies/${featuredMovie.id}`} 
                  className="bg-gray-500/50 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-500/70 backdrop-blur-sm transition flex items-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Mais Info
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* --- LISTAS DE CONTEÚDO --- */}
      <div className="relative z-20 px-4 md:px-12 space-y-8 -mt-16">
        
        {continueList.length > 0 && (
          <ContinueWatching items={continueList} />
        )}

        {myList.length > 0 && (
          <MediaRow title="📂 A Minha Lista" itemsProp={myList} />
        )}

        <MediaRow title="🔥 Filmes em Alta" endpoint="trending/movie/week?" type="movie" />
        <MediaRow title="📺 Séries do Momento" endpoint="trending/tv/week?" type="tv" />
        <MediaRow title="🎬 Ação Pura" endpoint="discover/movie?with_genres=28&sort_by=popularity.desc" type="movie" />
        <MediaRow title="😂 Comédia" endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" type="movie" />
        <MediaRow title="🐉 Animação" endpoint="discover/movie?with_genres=16&sort_by=popularity.desc" type="movie" />
        <MediaRow title="👻 Terror" endpoint="discover/movie?with_genres=27&sort_by=popularity.desc" type="movie" />
      </div>
    </div>
  );
}