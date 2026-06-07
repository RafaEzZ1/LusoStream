"use client";

import { useEffect, useState } from "react";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import VideoPlayer from "@/components/VideoPlayer";

const API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY || "f0bde271cd8fdf3dea9cd8582b100a8e";

// Este componente recebe o ID vindo da pagina principal (Server)
export default function WatchMovieClient({ id }) {
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMovie() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`
        );

        if (!res.ok) throw new Error("Erro ao carregar dados TMDB");

        const data = await res.json();
        setMovieData(data);
      } catch (e) {
        console.error(e);
        setMovieData(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) getMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  const title = movieData?.title || "Assistir Filme";

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="relative w-full pt-24 md:pt-28 bg-black shadow-2xl px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase underline decoration-purple-600">
              {title}
            </h1>
            <ReportButton mediaId={id} mediaTitle={title} />
          </div>

          <VideoPlayer imdbId={movieData?.imdb_id} title={title} type="movie" />
        </div>
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <PlayerControls mediaId={id} type="movie" backLink={`/movies/${id}`} />
      </div>

      <ProgressTracker mediaId={id} type="movie" duration={7200} />
    </div>
  );
}
