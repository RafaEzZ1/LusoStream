"use client";

import { useEffect, useState } from "react";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import VideoPlayer from "@/components/VideoPlayer";

const API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY || "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function WatchEpisodeClient({ id, season, episode }) {
  const [seriesData, setSeriesData] = useState(null);
  const [episodeData, setEpisodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEpisodeData() {
      try {
        const baseUrl = "https://api.themoviedb.org/3";
        const seriesReq = fetch(
          `${baseUrl}/tv/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=external_ids`
        );
        const episodeReq = fetch(
          `${baseUrl}/tv/${id}/season/${season}/episode/${episode}?api_key=${API_KEY}&language=pt-BR&append_to_response=external_ids`
        );

        const [seriesRes, episodeRes] = await Promise.all([
          seriesReq,
          episodeReq,
        ]);

        if (!seriesRes.ok) throw new Error("Erro ao carregar serie TMDB");

        const series = await seriesRes.json();
        const episodeInfo = episodeRes.ok ? await episodeRes.json() : null;

        setSeriesData(series);
        setEpisodeData(episodeInfo);
      } catch (e) {
        console.error("Erro ao carregar episodio:", e);
        setSeriesData(null);
        setEpisodeData(null);
      } finally {
        setLoading(false);
      }
    }

    if (id && season && episode) getEpisodeData();
  }, [id, season, episode]);

  const nextEp = Number(episode) + 1;
  const seriesTitle = seriesData?.name || `Serie ${id}`;
  const episodeTitle = episodeData?.name || `Episodio ${episode}`;
  const playerTitle = `${seriesTitle} - T${season}:E${episode} ${episodeTitle}`;
  const imdbId =
    episodeData?.external_ids?.imdb_id || seriesData?.external_ids?.imdb_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="relative w-full pt-24 md:pt-28 bg-black shadow-2xl px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col">
              <span className="text-purple-500 font-bold text-xs uppercase tracking-widest">
                {seriesTitle}
              </span>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight">
                Temporada {season} - Episodio {episode}
              </h1>
            </div>

            <ReportButton mediaId={id} mediaTitle={playerTitle} />
          </div>

          <VideoPlayer imdbId={imdbId} title={playerTitle} type="series" />
        </div>
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <PlayerControls
          mediaId={id}
          type="tv"
          season={season}
          episode={episode}
          backLink={`/series/${id}`}
          nextEpisodeLink={`/watch/series/${id}/season/${season}/episode/${nextEp}`}
        />
      </div>

      <ProgressTracker
        mediaId={id}
        type="tv"
        season={season}
        episode={episode}
        duration={2700}
      />
    </div>
  );
}
