// src/app/series/[id]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; 
import Navbar from "@/components/Navbar";
// SEM FOOTER AQUI (já vem do layout)
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; 

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Estados
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  
  // Minha Lista
  const [user, setUser] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Hook de Arrastar
  const castRef = useRef(null);
  const { events: castEvents } = useDraggableScroll();

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (id) {
        await fetchSeriesDetails(id);
        if (currentUser) checkMyList(currentUser.id, id);
      }
    }
    loadData();
  }, [id]);

  async function fetchSeriesDetails(seriesId) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`
      );
      const data = await res.json();
      setSeries(data);

      // Lógica do Trailer (Geralmente a API retorna o Trailer da Season 1 ou Geral aqui)
      const videos = data.videos?.results || [];
      const officialTrailer = videos.find(v => v.site === "YouTube" && v.type === "Trailer");
      const teaser = videos.find(v => v.site === "YouTube" && v.type === "Teaser");
      
      if (officialTrailer) setTrailerKey(officialTrailer.key);
      else if (teaser) setTrailerKey(teaser.key);

    } catch (error) {
      console.error("Erro:", error);
    }
    setLoading(false);
  }

  async function checkMyList(userId, seriesId) {
    const { data } = await supabase
      .from("watchlists")
      .select("*")
      .eq("user_id", userId)
      .eq("item_id", seriesId)
      .eq("item_type", "tv") // Importante: TV para séries
      .maybeSingle();

    if (data) setIsInList(true);
  }

  async function toggleMyList() {
    if (!user) return router.push("/auth");
    
    setListLoading(true);
    if (isInList) {
      await supabase.from("watchlists").delete().eq("user_id", user.id).eq("item_id", series.id).eq("item_type", "tv");
      setIsInList(false);
    } else {
      await supabase.from("watchlists").insert({ user_id: user.id, item_id: series.id, item_type: "tv" });
      setIsInList(true);
    }
    setListLoading(false);
  }

  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
  if (!series) return <div className="text-white text-center pt-40">Série não encontrada.</div>;

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans pb-20">
      <Navbar />

      {/* HERO SECTION */}
      <div className="relative w-full min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center fixed-bg" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center pt-20">
          <div className="hidden md:block col-span-1">
            <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className="w-full rounded-xl shadow-2xl border border-gray-800" />
          </div>
          
          <div className="col-span-1 md:col-span-2 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{series.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
              <span className="text-green-400 font-bold border border-green-400/30 bg-green-400/10 px-2 py-0.5 rounded">{Math.round(series.vote_average * 10)}% Relevância</span>
              <span>{series.first_air_date?.split("-")[0]}</span>
              {/* Duração Média do Episódio */}
              <span>{series.episode_run_time?.[0] || "?"} min</span>
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs bg-gray-800">{series.number_of_seasons} Temporadas</span>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl line-clamp-4 md:line-clamp-none">{series.overview}</p>

            {/* BOTÕES DE AÇÃO */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              
              {/* 1. ASSISTIR (Azul para diferenciar de filmes, ou mantemos vermelho?) -> Vou usar Azul para séries ficarem fixes */}
              <Link href={`/watch/tv/${series.id}`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-900/40">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Assistir
              </Link>

              {/* 2. MINHA LISTA */}
              <button onClick={toggleMyList} disabled={listLoading} className={`font-bold py-3 px-6 rounded-full transition border flex items-center gap-2 ${isInList ? "bg-green-600 border-green-600 text-white" : "bg-gray-800/60 border-gray-500 text-white hover:bg-gray-700"}`}>
                {listLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : isInList ? (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Na Lista</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Minha Lista</>
                )}
              </button>

              {/* 3. TRAILER */}
              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-full transition border border-white/30 flex items-center gap-2 backdrop-blur-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8zm2 3h6v-1H7v1z" /></svg>
                  Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* ELENCO */}
        {series.credits?.cast?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-blue-600 pl-4">Elenco</h2>
            <div ref={castRef} {...castEvents(castRef)} className="flex gap-5 overflow-x-auto pb-4 no-scrollbar cursor-grab active:cursor-grabbing">
              {series.credits.cast.slice(0, 15).map((actor) => (
                <div key={actor.id} className="flex-none w-32 group select-none">
                  <div className="w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-800 group-hover:border-blue-600 transition">
                    <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/no-avatar.png"} alt={actor.name} onDragStart={(e) => e.preventDefault()} className="w-full h-full object-cover pointer-events-none" />
                  </div>
                  <p className="text-sm font-bold text-center truncate">{actor.name}</p>
                  <p className="text-xs text-gray-500 text-center truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELACIONADOS */}
        {series.similar?.results?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-blue-600 pl-4">Recomendados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {series.similar.results.slice(0, 10).map((sim) => (
                <Link key={sim.id} href={`/series/${sim.id}`} className="group block relative">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-800 shadow-lg group-hover:scale-105 transition duration-300">
                    <img src={sim.poster_path ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` : "/no-image.jpg"} alt={sim.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{sim.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL TRAILER */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
               <span className="font-bold text-white">Trailer Oficial</span>
               <button onClick={() => setShowTrailer(false)} className="bg-gray-800 hover:bg-red-600 text-white rounded-full p-2 transition">✕</button>
            </div>
            <div className="aspect-video">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}