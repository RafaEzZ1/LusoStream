// src/app/series/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { supabase } from "@/lib/supabaseClient";
import WatchlistButton from "@/components/WatchlistButton";
// 👇 Importar as Recomendações
import Recommendations from "@/components/Recommendations";

export const dynamic = "force-dynamic";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesPage() {
  const { id } = useParams();
  const router = useRouter();

  const [seriesInfo, setSeriesInfo] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      // 1) Buscar Info ao TMDB (endpoint 'tv')
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      setSeriesInfo(data);

      // 2) Verificar status (visto)
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess?.session?.user?.id;
      if (userId) {
        const { data: row } = await supabase
          .from("user_progress")
          .select("status")
          .eq("user_id", userId)
          .eq("item_type", "series") // nota: aqui é 'series' no teu sistema
          .eq("item_id", id)
          .maybeSingle();

        if (row?.status === "finished") setIsFinished(true);
      }
    })();
  }, [id]);

  // Começar a ver (Season 1, Episódio 1)
  function startWatching() {
    router.push(`/watch/series/${id}/season/1/episode/1`);
  }

  if (!seriesInfo) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <p className="pt-24 px-6">A carregar série…</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle={`${seriesInfo.name} - LusoStream`} />

      <div className="pt-24 px-6 max-w-5xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <img
              src={
                seriesInfo.poster_path
                  ? `https://image.tmdb.org/t/p/w500${seriesInfo.poster_path}`
                  : "/no-image.jpg"
              }
              alt={seriesInfo.name}
              className="rounded-lg shadow-lg w-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <h1 className="text-4xl font-bold mb-4">{seriesInfo.name}</h1>
              {isFinished && (
                <span className="mt-1 inline-flex items-center gap-1 text-sm bg-green-700/30 border border-green-600 text-green-300 px-2 py-1 rounded">
                  ✓ Vista
                </span>
              )}
            </div>

            <p className="mb-4 text-gray-300 leading-relaxed">
              {seriesInfo.overview || "Sem sinopse disponível."}
            </p>
            <p className="mb-1 text-gray-400">
              <strong className="text-white">Data de estreia:</strong>{" "}
              {seriesInfo.first_air_date || "—"}
            </p>
            <p className="mb-1 text-gray-400">
              <strong className="text-white">Temporadas:</strong>{" "}
              {seriesInfo.number_of_seasons || "—"}
            </p>
            <p className="mb-6 text-gray-400">
              <strong className="text-white">Episódios:</strong>{" "}
              {seriesInfo.number_of_episodes || "—"}
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Botão Ver (Leva ao S1 E1) */}
              <button
                onClick={startWatching}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded font-bold shadow-lg shadow-red-900/20 transition hover:scale-105"
              >
                ▶ Começar a Ver
              </button>

              {/* Watchlist */}
              <WatchlistButton itemId={id} itemType="series" />
            </div>
          </div>
        </div>

        {/* 👇 AQUI ESTÃO AS RECOMENDAÇÕES PARA SÉRIES */}
        <div className="border-t border-gray-800 mt-12 pt-8">
           <Recommendations type="tv" id={id} />
        </div>

      </div>
    </div>
  );
}