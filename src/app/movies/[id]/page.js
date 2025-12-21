// src/app/movies/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { supabase } from "@/lib/supabaseClient";
import { getMovieEmbed } from "@/lib/embeds";
import { touchMovieProgress } from "@/lib/progress";

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

      // 2) embed
      const embedUrl = await getMovieEmbed(id);
      setHasEmbed(!!embedUrl);

      // 3) gravar progresso
      await touchMovieProgress(id, {
        estimated_duration_seconds: data?.runtime ? data.runtime * 60 : null,
        status: "in_progress",
      });

      // 4) ver se já estava concluído
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

      <div className="pt-24 px-6 max-w-5xl mx-auto pb-12 flex flex-col md:flex-row gap-6">
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

        <div className="flex-1">
          <div className="flex items-start gap-3">
            <h1 className="text-4xl font-bold mb-4">{movieInfo.title}</h1>
            {isFinished && (
              <span className="mt-1 inline-flex items-center gap-1 text-sm bg-green-700/30 border border-green-600 text-green-300 px-2 py-1 rounded">
                ✓ Visto
              </span>
            )}
          </div>

          <p className="mb-4">
            {movieInfo.overview || "Sem sinopse disponível."}
          </p>
          <p className="mb-1">
            <strong>Data de lançamento:</strong>{" "}
            {movieInfo.release_date || "—"}
          </p>
          <p className="mb-6">
            <strong>Duração:</strong>{" "}
            {movieInfo.runtime ? `${movieInfo.runtime} min` : "—"}
          </p>

          {hasEmbed ? (
            <button
              onClick={goWatch}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded font-semibold"
            >
              ▶ Ver filme
            </button>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg w-full md:w-2/3 text-center">
              <p className="text-red-500 text-xl font-semibold">
                Ainda não temos este filme disponível.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
