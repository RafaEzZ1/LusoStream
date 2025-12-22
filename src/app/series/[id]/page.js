// src/app/series/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { supabase } from "@/lib/supabaseClient";
import WatchlistButton from "@/components/WatchlistButton";
import Recommendations from "@/components/Recommendations";
// 👇 Importar o Skeleton
import SkeletonLoader from "@/components/SkeletonLoader";

export const dynamic = "force-dynamic";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesPage() {
  const { id } = useParams();
  const router = useRouter();

  const [seriesInfo, setSeriesInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  // Estados para seleção de episódios
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // 1. Carregar Info da Série
  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`
        );
        const data = await res.json();
        setSeriesInfo(data);

        // Verificar se já viu
        const { data: sess } = await supabase.auth.getSession();
        const userId = sess?.session?.user?.id;
        if (userId) {
          const { data: row } = await supabase
            .from("user_progress")
            .select("status")
            .eq("user_id", userId)
            .eq("item_type", "series")
            .eq("item_id", id)
            .maybeSingle();
          if (row?.status === "finished") setIsFinished(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // 2. Carregar Episódios quando muda a Temporada
  useEffect(() => {
    if (!id || !seriesInfo) return;

    (async () => {
      setLoadingEpisodes(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason}?api_key=${API_KEY}&language=pt-BR`
        );
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (e) {
        console.error("Erro episódios", e);
      } finally {
        setLoadingEpisodes(false);
      }
    })();
  }, [id, selectedSeason, seriesInfo]);

  function startWatching() {
    router.push(`/watch/series/${id}/season/1/episode/1`);
  }

  // 👇 Se estiver a carregar, mostra o SKELETON
  if (loading || !seriesInfo) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <SkeletonLoader />
      </div>
    );
  }

  const seasons = seriesInfo.seasons || [];

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle={`${seriesInfo.name} - LusoStream`} />

      <div className="pt-24 px-6 max-w-6xl mx-auto pb-12">
        
        {/* HEADER DA SÉRIE */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-full md:w-1/3 max-w-[300px] mx-auto md:mx-0">
            <img
              src={seriesInfo.poster_path ? `https://image.tmdb.org/t/p/w500${seriesInfo.poster_path}` : "/no-image.jpg"}
              alt={seriesInfo.name}
              className="rounded-xl shadow-2xl w-full object-cover border border-gray-800"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-4xl md:text-5xl font-bold">{seriesInfo.name}</h1>
               {isFinished && <span className="bg-green-600/20 text-green-400 text-xs px-2 py-1 rounded border border-green-600/50">VISTA</span>}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
               <span>{seriesInfo.first_air_date?.split("-")[0]}</span>
               <span>•</span>
               <span>{seriesInfo.number_of_seasons} Temporadas</span>
               <span>•</span>
               <span className="bg-gray-800 px-2 rounded text-white border border-gray-700">TMDB {seriesInfo.vote_average?.toFixed(1)}</span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-8 text-lg">
              {seriesInfo.overview || "Sem sinopse disponível."}
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={startWatching}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-900/30 transition transform hover:scale-105 flex items-center gap-2"
              >
                ▶ Começar a Ver
              </button>
              <WatchlistButton itemId={id} itemType="series" />
            </div>
          </div>
        </div>

        {/* SELETOR DE TEMPORADAS */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">Episódios</h2>
          
          <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-thin scrollbar-thumb-gray-800">
            {seasons.map((season) => (
              season.season_number > 0 && (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season.season_number)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition ${
                    selectedSeason === season.season_number
                      ? "bg-white text-black scale-105 shadow-lg shadow-white/20"
                      : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  Temporada {season.season_number}
                </button>
              )
            ))}
          </div>

          {/* LISTA DE EPISÓDIOS */}
          {loadingEpisodes ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-gray-800 rounded-lg"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/watch/series/${id}/season/${selectedSeason}/episode/${ep.episode_number}`}
                  className="group bg-gray-900 hover:bg-gray-800 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition flex flex-col"
                >
                  <div className="relative aspect-video bg-black">
                     <img 
                        src={ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : "/no-image.jpg"} 
                        alt={ep.name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                     />
                     <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm">
                        Ep {ep.episode_number}
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
                        <div className="bg-red-600 rounded-full p-2 shadow-lg">
                           <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                     </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                     <div>
                        <h4 className="font-bold text-gray-200 group-hover:text-white mb-1 line-clamp-1">{ep.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ep.overview || "Sem descrição."}</p>
                     </div>
                     <span className="text-xs text-gray-600 font-mono">{ep.air_date}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recomendações */}
        <div className="border-t border-gray-800 mt-16 pt-8">
           <Recommendations type="tv" id={id} />
        </div>
      </div>
    </div>
  );
}