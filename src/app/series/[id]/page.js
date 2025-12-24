// src/app/series/[id]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; 
import Navbar from "@/components/Navbar";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; 

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // ESTADO DA SÉRIE (Prioridade Máxima)
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  
  // ESTADO DAS TEMPORADAS
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // ESTADO DO USER (Prioridade Baixa - Segundo Plano)
  const [user, setUser] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Hook de Arrastar
  const castRef = useRef(null);
  const { events: castEvents } = useDraggableScroll();

  // 1. CARREGAR SÉRIE IMEDIATAMENTE (Não espera pelo login)
  useEffect(() => {
    if (!id) return;

    async function fetchSeries() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`
        );
        const data = await res.json();
        setSeries(data);

        // Trailer
        const videos = data.videos?.results || [];
        const trailer = videos.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
        if (trailer) setTrailerKey(trailer.key);
      } catch (error) { console.error("Erro série:", error); }
      finally { setLoading(false); } // Liberta a página
    }

    fetchSeries();
  }, [id]);

  // 2. VERIFICAR USER EM PARALELO
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Verificar Lista
        const { data } = await supabase
          .from("watchlists")
          .select("id")
          .eq("user_id", session.user.id)
          .eq("item_id", id)
          .eq("item_type", "tv")
          .maybeSingle();
        
        if (data) setIsInList(true);
      }
    }
    checkUser();
  }, [id]);

  // 3. CARREGAR EPISÓDIOS (Sempre que muda a temporada)
  useEffect(() => {
    if (id && selectedSeason) {
      async function fetchEpisodes() {
        setLoadingEpisodes(true);
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason}?api_key=${API_KEY}&language=pt-BR`
          );
          const data = await res.json();
          setEpisodes(data.episodes || []);
        } catch (error) { console.error("Erro episódios:", error); }
        setLoadingEpisodes(false);
      }
      fetchEpisodes();
    }
  }, [id, selectedSeason]);

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

  // Loading APENAS para a série principal
  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>;
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
          <div className="hidden md:block col-span-1 animate-in fade-in duration-700">
            <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className="w-full rounded-xl shadow-2xl border border-gray-800" />
          </div>
          
          <div className="col-span-1 md:col-span-2 space-y-6 animate-in slide-in-from-right-10 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{series.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
              <span className="text-green-400 font-bold border border-green-400/30 bg-green-400/10 px-2 py-0.5 rounded">{Math.round(series.vote_average * 10)}% Relevância</span>
              <span>{series.first_air_date?.split("-")[0]}</span>
              <span>{series.number_of_seasons} Temporadas</span>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl line-clamp-4 md:line-clamp-none">{series.overview}</p>

            {/* BOTÕES */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href={`/watch/series/${series.id}/season/1/episode/1`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition hover:scale-105 flex items-center gap-2 shadow-lg shadow-blue-900/40">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Assistir
              </Link>

              <button onClick={toggleMyList} disabled={listLoading} className={`font-bold py-3 px-6 rounded-full transition border flex items-center gap-2 ${isInList ? "bg-green-600 border-green-600 text-white" : "bg-gray-800/60 border-gray-500 text-white hover:bg-gray-700"}`}>
                {listLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : isInList ? (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> Na Lista</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Minha Lista</>
                )}
              </button>

              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-full transition border border-white/30 flex items-center gap-2 backdrop-blur-md">
                  Trailer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {/* EPISÓDIOS */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-white border-l-4 border-blue-600 pl-4">Episódios</h2>
            
            <select 
              className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 outline-none focus:border-blue-600 transition font-bold"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
            >
              {Array.from({ length: series.number_of_seasons }, (_, i) => i + 1).map((seasonNum) => (
                <option key={seasonNum} value={seasonNum}>Temporada {seasonNum}</option>
              ))}
            </select>
          </div>

          {loadingEpisodes ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((ep) => (
                <Link 
                  key={ep.id} 
                  href={`/watch/series/${series.id}/season/${selectedSeason}/episode/${ep.episode_number}`}
                  className="bg-gray-900 rounded-lg overflow-hidden flex gap-4 hover:bg-gray-800 transition border border-gray-800 hover:border-blue-600 group h-32"
                >
                  <div className="w-40 h-full relative flex-shrink-0 bg-gray-800">
                    <img 
                      src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : "/no-image.jpg"} 
                      alt={ep.name} 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                    />
                    <div className="absolute bottom-1 left-1 bg-black/80 px-2 py-0.5 text-xs font-bold rounded text-white">
                       E{ep.episode_number}
                    </div>
                  </div>

                  <div className="py-2 pr-3 flex flex-col justify-center overflow-hidden w-full">
                    <h4 className="font-bold text-gray-200 group-hover:text-blue-400 truncate text-sm">{ep.episode_number}. {ep.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ep.overview || "Sem descrição disponível."}</p>
                    <p className="text-xs text-gray-600 mt-2 font-mono">{ep.air_date?.split("-")[0] || "N/A"} • {ep.runtime || "?"} min</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RECOMENDADOS */}
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