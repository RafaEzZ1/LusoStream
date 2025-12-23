// src/app/movies/[id]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Para a Minha Lista
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; // Hook de Arrastar

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Estados de Dados
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de Interface
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  
  // Estados da Minha Lista
  const [user, setUser] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Hook para Arrastar o Elenco
  const castRef = useRef(null);
  const { events: castEvents } = useDraggableScroll();

  // 1. Carregar Filme e Dados do Utilizador
  useEffect(() => {
    async function loadData() {
      // Pega o User Atual
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (id) {
        await fetchMovieDetails(id);
        if (currentUser) checkMyList(currentUser.id, id);
      }
    }
    loadData();
  }, [id]);

  // 2. Buscar Detalhes do TMDB
  async function fetchMovieDetails(movieId) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`
      );
      const data = await res.json();
      setMovie(data);

      // Encontrar Trailer
      const videos = data.videos?.results || [];
      const officialTrailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer");
      const teaser = videos.find(v => v.site === "YouTube" && v.type === "Teaser");
      
      if (officialTrailer) setTrailerKey(officialTrailer.key);
      else if (teaser) setTrailerKey(teaser.key);

    } catch (error) {
      console.error("Erro ao carregar filme:", error);
    }
    setLoading(false);
  }

  // 3. Verificar se está na Minha Lista
  async function checkMyList(userId, movieId) {
    const { data } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", movieId)
      .eq("item_type", "movie")
      .maybeSingle();

    if (data) setIsInList(true);
  }

  // 4. Adicionar / Remover da Lista
  async function toggleMyList() {
    if (!user) {
      alert("Precisas de fazer login para adicionar à lista!");
      router.push("/auth");
      return;
    }
    
    setListLoading(true);

    if (isInList) {
      // Remover
      await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", movie.id)
        .eq("item_type", "movie");
      setIsInList(false);
    } else {
      // Adicionar
      await supabase
        .from("watchlists")
        .insert({
          user_id: user.id,
          item_id: movie.id,
          item_type: "movie"
        });
      setIsInList(true);
    }
    setListLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) return <div className="text-white text-center pt-40">Filme não encontrado.</div>;

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans">
      <Navbar />

      {/* HERO SECTION */}
      <div className="relative w-full min-h-[85vh] flex items-center">
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat fixed-bg"
          style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center pt-20">
          
          {/* Poster (PC) */}
          <div className="hidden md:block col-span-1">
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title} 
              className="w-full rounded-xl shadow-2xl shadow-red-900/20 border border-gray-800 transform rotate-1 hover:rotate-0 transition duration-500"
            />
          </div>
          
          {/* Info + Botões */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              {movie.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
              <span className="text-green-400 font-bold border border-green-400/30 bg-green-400/10 px-2 py-0.5 rounded">
                {Math.round(movie.vote_average * 10)}% Relevância
              </span>
              <span>{movie.release_date?.split("-")[0]}</span>
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs bg-gray-800">
                {movie.adult ? "+18" : "Livre"}
              </span>
              <span>{movie.runtime} min</span>
              <div className="flex gap-2">
                 {movie.genres?.slice(0, 3).map(g => (
                   <span key={g.id} className="text-gray-400 italic">#{g.name}</span>
                 ))}
              </div>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              {movie.overview || "Sem sinopse disponível."}
            </p>

            {/* --- BOTÕES DE AÇÃO --- */}
            <div className="flex flex-wrap gap-4 pt-4">
              
              {/* 1. ASSISTIR */}
              <Link 
                href={`/watch/movie/${movie.id}`} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center gap-3 shadow-lg shadow-red-900/40 text-lg"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Assistir
              </Link>

              {/* 2. MINHA LISTA (NOVO) */}
              <button 
                onClick={toggleMyList}
                disabled={listLoading}
                className={`
                  font-bold py-3 px-6 rounded-full transition border flex items-center gap-2
                  ${isInList 
                    ? "bg-green-600 border-green-600 text-white hover:bg-green-700" 
                    : "bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700 hover:border-white"
                  }
                `}
              >
                {listLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : isInList ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Na Lista
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Minha Lista
                  </>
                )}
              </button>

              {/* 3. TRAILER */}
              {trailerKey && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition border border-gray-600 flex items-center gap-2 backdrop-blur-md"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8zm2 3h6v-1H7v1z" /></svg>
                  Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* ELENCO COM ARRASTAR (DRAG) */}
        {movie.credits?.cast?.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">Elenco Principal</h2>
            
            {/* Apliquei o Hook AQUI */}
            <div 
              ref={castRef}
              {...castEvents(castRef)}
              className="flex gap-6 overflow-x-auto pb-6 no-scrollbar cursor-grab active:cursor-grabbing"
            >
              {movie.credits.cast.slice(0, 15).map((actor) => (
                <div key={actor.id} className="flex-none w-36 group select-none">
                  <div className="w-32 h-32 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-800 group-hover:border-red-600 transition shadow-lg">
                    <img 
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/no-avatar.png"} 
                      alt={actor.name} 
                      // PREVINE QUE A IMAGEM SEJA ARRASTADA
                      onDragStart={(e) => e.preventDefault()}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500 pointer-events-none"
                    />
                  </div>
                  <p className="text-sm font-bold text-white truncate text-center group-hover:text-red-500 transition">{actor.name}</p>
                  <p className="text-xs text-gray-500 truncate text-center">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELACIONADOS */}
        {movie.similar?.results?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">Quem viu este, também gostou</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movie.similar.results.slice(0, 10).map((sim) => (
                <Link key={sim.id} href={`/movies/${sim.id}`} className="group block relative">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-800 shadow-lg border border-gray-800 group-hover:border-gray-500 transition">
                    <img 
                      src={sim.poster_path ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` : "/no-image.jpg"} 
                      alt={sim.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded">
                      ★ {sim.vote_average?.toFixed(1)}
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-300 group-hover:text-white truncate transition px-1">
                    {sim.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DO TRAILER */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-md">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 ring-1 ring-white/10">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
               <span className="font-bold text-white flex items-center gap-2">
                 📺 Trailer Oficial
               </span>
               <button 
                onClick={() => setShowTrailer(false)}
                className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-600 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`} 
                title="Trailer" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}