// src/app/watch/movie/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { getMovieEmbed } from "@/lib/embeds";
import { touchMovieProgress, markMovieFinished } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function WatchMoviePage() {
  const { id } = useParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [embedLink, setEmbedLink] = useState(null);
  const [loading, setLoading] = useState(true);

  // carrega info + embed + toca progresso
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`
        );
        const d = await r.json();
        if (!cancelled) setMovie(d?.id ? d : null);

        const fromDb = await getMovieEmbed(id);
        if (!cancelled) setEmbedLink(fromDb || null);

        // 👇 toca progresso logo que abriu
        await touchMovieProgress(id, {
          status: "in_progress",
          estimated_duration_seconds: d?.runtime ? d.runtime * 60 : null,
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setMovie(null);
          setEmbedLink(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleMarkDone() {
    await markMovieFinished(id, movie?.runtime ? movie.runtime * 60 : null);
    alert("Marcado como concluído ✅");
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle
        pageTitle={movie?.title ? `${movie.title} - LusoStream` : "Ver Filme - LusoStream"}
      />

      <main className="pt-24 px-6 max-w-6xl mx-auto pb-10">
        <button onClick={() => router.back()} className="text-sm text-gray-300 hover:text-white">
          ← Voltar
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mt-2">{movie?.title || "Ver Filme"}</h1>

        {loading ? (
          <p className="mt-4 text-gray-400">A carregar…</p>
        ) : embedLink ? (
          <>
            <div className="mt-4 aspect-video w-full rounded-lg overflow-hidden border border-gray-800">
              <iframe
                src={embedLink}
                width="100%"
                height="100%"
                allowFullScreen
                frameBorder="0"
                title={movie?.title || "Player"}
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={handleMarkDone}
              className="mt-4 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Marcar como concluído
            </button>
          </>
        ) : (
          <div className="mt-4 bg-gray-900 p-6 rounded-lg border border-gray-800">
            <p className="text-red-500 text-lg font-semibold">
              Ainda não temos este filme disponível.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
