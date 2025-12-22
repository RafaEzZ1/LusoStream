// src/app/movies/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { supabase } from "@/lib/supabaseClient";
import { getMovieEmbed } from "@/lib/embeds";
import WatchlistButton from "@/components/WatchlistButton";
// 👇 Importar o componente de recomendações
import Recommendations from "@/components/Recommendations";

export const dynamic = "force-dynamic";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MoviePage() {
  const { id } = useParams();
  const router = useRouter();

  const [movieInfo, setMovieInfo] = useState(null);
  const [hasEmbed, setHasEmbed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      // 1) TMDB
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`
      );
      const data = await res.json();
      setMovieInfo(data);

      // 2) Embed
      const embedUrl = await getMovieEmbed(id);
      setHasEmbed(!!embedUrl);

      // 3) Verificar status (visto)
      const { data: sess } = await supabase.auth.getSession();
      const userId = sess?.session?.user?.id;
      if (userId) {
        const { data: row } = await supabase
          .from("user_progress")
          .select("status")
          .eq("user_id", userId)
          .eq("item_type", "movie")
          .eq("item_id", id)
          .maybeSingle();

        if (row?.status === "finished") setIsFinished(true);
      }
    })();
  }, [id]);

  function goWatch() {
    router.push(`/watch/movie/${id}`);
  }

  if (!movieInfo) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <p className="pt-24 px-6">A carregar filme…</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle={`${movieInfo.title} - LusoStream`} />

      <div className="pt-24 px-6 max-w-5xl mx-auto pb-12">
        {/* Bloco Superior: Informações do Filme */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Poster */}
          <div className="w-full md:w-1/3">
            <img
              src={
                movieInfo.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movieInfo.poster_path}`
                  : "/no-image.jpg"
              }
              alt={movieInfo.title}
              className="rounded-lg shadow-lg w-full object-cover"
            />
          </div>

          {/* Detalhes */}
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <h1 className="text-4xl font-bold mb-4">{movieInfo.title}</h1>
              {isFinished && (
                <span className="mt-1 inline-flex items-center gap-1 text-sm bg-green-700/30 border border-green-600 text-green-300 px-2 py-1 rounded">
                  ✓ Visto
                </span>
              )}
            </div>

            <p className="mb-4 text-gray-300 leading-relaxed">
              {movieInfo.overview || "Sem sinopse disponível."}
            </p>
            <p className="mb-1 text-gray-400">
              <strong className="text-white">Data de lançamento:</strong>{" "}
              {movieInfo.release_date || "—"}
            </p>
            <p className="mb-6 text-gray-400">
              <strong className="text-white">Duração:</strong>{" "}
              {movieInfo.runtime ? `${movieInfo.runtime} min` : "—"}
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Botão de Ver Filme */}
              {hasEmbed ? (
                <button
                  onClick={goWatch}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded font-bold shadow-lg shadow-red-900/20 transition hover:scale-105"
                >
                  ▶ Ver filme
                </button>
              ) : (
                <div className="bg-gray-800 px-5 py-2 rounded text-red-400 font-semibold border border-red-900/30 cursor-not-allowed">
                  Indisponível
                </div>
              )}

              {/* Botão da Watchlist */}
              <WatchlistButton itemId={id} itemType="movie" />
            </div>
          </div>
        </div>

        {/* 👇 NOVA SECÇÃO: RECOMENDAÇÕES */}
        <div className="border-t border-gray-800 mt-12 pt-8">
           <Recommendations type="movie" id={id} />
        </div>
        
      </div>
    </div>
  );
}