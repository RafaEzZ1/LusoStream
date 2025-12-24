"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; 
import { useAuth } from "@/components/AuthProvider";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const castRef = useRef(null);
  const { events: castEvents } = useDraggableScroll();

  useEffect(() => {
    if (!id) return;
    async function fetchSeries() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`
        );
        const data = await res.json();
        setSeries(data);

        const videos = data.videos?.results || [];
        const trailer = videos.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
        if (trailer) setTrailerKey(trailer.key);
      } catch (error) { console.error("Erro série:", error); }
      finally { setLoading(false); }
    }
    fetchSeries();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      supabase.from("watchlists").select("id").eq("user_id", user.id).eq("item_id", id).eq("item_type", "tv").maybeSingle()
        .then(({ data }) => { if (data) setIsInList(true); });
    }
  }, [user, id]);

  useEffect(() => {
    if (id && series) {
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
  }, [id, selectedSeason, series]);

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

  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent shadow-lg shadow-blue-900"></div></div>;
  if (!series || !series.name) return <div className="bg-black min-h-screen text-white flex items-center justify-center text-xl">Série não encontrada.</div>;

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans pb-20 selection:bg-blue-900 selection:text-white">
      <Navbar />

      <div className="relative w-full min-h-[90vh] flex items-center overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-110" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${series.backdrop_path})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center pt-24">
          <div className="hidden md:block col-span-1 animate-in fade-in slide-in-from-left-8 duration-700">
            <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className="w-full rounded-2xl shadow-2xl shadow-black/50 border border-white/10 hover:border-blue-600/50 transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1" />
          </div>
          <div className="col-span-1 md:col-span-2 space-y-8 animate-in slide-in-from-right-8 duration-700">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl mb-4">{series.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                <span className="text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded-md shadow-sm shadow-green-900/20">{Math.round(series.vote_average * 10)}% Relevância</span>
                <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm">{series.first_air_date?.split("-")[0]}</span>
                <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-md">{series.number_of_seasons} Temporadas</span>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl drop-shadow-md">{series.overview}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href={`/watch/series/${series.id}/season/1/episode/1`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-blue-900/50 group">
                <svg className="w-7 h-7 fill-current group-hover:animate-pulse" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span className="text-lg">Começar Agora</span>
              </Link>
              <button onClick={toggleMyList} disabled={listLoading} className={`font-bold py-4 px-8 rounded-full transition border flex items-center gap-2 ${isInList ? "bg-green-600 border-green-600 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"}`}>
                {listLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : isInList ? "✓ Na Lista" : "+ Minha Lista"}
              </button>
              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition border border-white/30 flex items-center gap-2 backdrop-blur-sm">Trailer</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-800 pb-6 gap-4">
            <h2 className="text-2xl font-bold text-white border-l-4 border-blue-600 pl-4 flex items-center gap-2">Episódios <span className="text-gray-500 text-base font-normal">({episodes.length})</span></h2>
            <div className="relative">
              <select 
                className="appearance-none bg-gray-900 border border-gray-700 text-white text-lg rounded-lg pl-5 pr-12 py-3 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition shadow-lg cursor-pointer" 
                value={selectedSeason} onChange={(e) => setSelectedSeason(Number(e.target.value))}
              >
                {Array.from({ length: series.number_of_seasons }, (_, i) => i + 1).map((seasonNum) => (
                  <option key={seasonNum} value={seasonNum}>Temporada {seasonNum}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">▼</div>
            </div>
          </div>

          {loadingEpisodes ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((ep) => (
                <Link key={ep.id} href={`/watch/series/${series.id}/season/${selectedSeason}/episode/${ep.episode_number}`} className="bg-gray-900/50 rounded-xl overflow-hidden flex gap-0 hover:bg-gray-800 transition border border-gray-800 hover:border-blue-600/50 group h-36 shadow-lg">
                  <div className="w-48 h-full relative flex-shrink-0 bg-gray-900">
                    <img src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : "/no-image.jpg"} alt={ep.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300" />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 text-xs font-bold rounded text-white border border-white/10">E{ep.episode_number}</div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40"><svg className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>
                  </div>
                  <div className="p-4 flex flex-col justify-center overflow-hidden w-full">
                    <h4 className="font-bold text-gray-100 group-hover:text-blue-400 truncate text-base mb-1 transition-colors">{ep.name || `Episódio ${ep.episode_number}`}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{ep.overview || "Sem descrição disponível."}</p>
                    <div className="mt-auto flex items-center gap-2 text-xs text-gray-400 font-mono">
                      <span>⏱ {ep.runtime || "?"} min</span> <span>•</span> <span>📅 {ep.air_date ? new Date(ep.air_date).toLocaleDateString('pt-PT') : "N/A"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {series.credits?.cast?.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-blue-600 pl-4">Elenco Principal</h2>
            <div ref={castRef} {...castEvents(castRef)} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar cursor-grab active:cursor-grabbing p-1">
              {series.credits.cast.slice(0, 15).map((actor) => (
                <div key={actor.id} className="flex-none w-40 group select-none relative bg-gray-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-blue-600/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="w-full h-48 overflow-hidden">
                    <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w300${actor.profile_path}` : "/no-avatar.png"} alt={actor.name} onDragStart={(e) => e.preventDefault()} className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-white truncate">{actor.name}</p>
                    {(actor.character || actor.roles?.[0]?.character) && (
                      <p className="text-xs text-gray-400 mt-1 truncate italic">como {actor.character || actor.roles[0].character}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {series.similar?.results?.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-2xl font-bold text-white mb-8 border-l-4 border-blue-600 pl-4">Séries Semelhantes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {series.similar.results.slice(0, 10).map((sim) => (
                <Link key={sim.id} href={`/series/${sim.id}`} className="group block relative bg-gray-900 rounded-xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/20">
                  <div className="aspect-[2/3] w-full relative">
                    <img src={sim.poster_path ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` : "/no-image.jpg"} alt={sim.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{sim.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
               <span className="font-bold text-white flex items-center gap-2">🎬 Trailer Oficial</span>
               <button onClick={() => setShowTrailer(false)} className="bg-white/10 hover:bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
            </div>
            <div className="aspect-video bg-black"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe></div>
          </div>
        </div>
      )}
    </div>
  );
}