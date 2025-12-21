// src/app/series/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { STREAMING_LINKS } from "@/lib/streamingLinks";
import DynamicTitle from "@/components/DynamicTitle";
import { isEpisodeCompleted } from "@/lib/progress";
import { listSeasonEmbeds } from "@/lib/embeds";
import { touchEpisodeProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesPage() {
  const { id } = useParams();
  const router = useRouter();

  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSeason, setOpenSeason] = useState(null);
  const [loadedSeasons, setLoadedSeasons] = useState({});
  const [doneMap, setDoneMap] = useState({});
  const [embedMapBySeason, setEmbedMapBySeason] = useState({});

  // Info principal
  useEffect(() => {
    async function fetchSeriesInfo() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`
        );
        const data = await res.json();

        if (!data || !data.id) {
          console.warn("Série não encontrada:", id);
          setSeries(null);
          setLoading(false);
          return;
        }

        setSeries(data);
        setSeasons(data.seasons || []);
      } catch (err) {
        console.error("Erro ao buscar série:", err);
        setSeries(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSeriesInfo();
  }, [id]);

  async function loadSeason(seasonNumber) {
    if (loadedSeasons[seasonNumber]) return;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=pt-BR`
      );
      const data = await res.json();

      if (data && data.episodes) {
        setLoadedSeasons((prev) => ({ ...prev, [seasonNumber]: data }));
        const map = await listSeasonEmbeds(id, seasonNumber);
        setEmbedMapBySeason((prev) => ({ ...prev, [seasonNumber]: map }));
      }
    } catch (err) {
      console.error(`Erro ao carregar temporada ${seasonNumber}:`, err);
    }
  }

  async function handleToggleSeason(seasonNumber) {
    if (openSeason === seasonNumber) {
      setOpenSeason(null);
      return;
    }

    setOpenSeason(seasonNumber);
    await loadSeason(seasonNumber);

    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=pt-BR`
    );
    const seasonData = await res.json();

    if (seasonData?.episodes) {
      const entries = await Promise.all(
        seasonData.episodes.map(async (ep) => {
          const done = await isEpisodeCompleted(id, seasonNumber, ep.episode_number);
          return [ep.episode_number, !!done];
        })
      );
      setDoneMap((prev) => ({
        ...prev,
        [seasonNumber]: Object.fromEntries(entries),
      }));
    }
  }

  // refrescar quando volta ao foco
  useEffect(() => {
    async function refreshOpenSeasonDone() {
      if (!openSeason) return;
      const sd = loadedSeasons[openSeason];
      if (!sd?.episodes) return;

      const entries = await Promise.all(
        sd.episodes.map(async (ep) => {
          const done = await isEpisodeCompleted(id, openSeason, ep.episode_number);
          return [ep.episode_number, !!done];
        })
      );
      setDoneMap((prev) => ({
        ...prev,
        [openSeason]: Object.fromEntries(entries),
      }));
    }

    function onFocus() {
      refreshOpenSeasonDone();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [openSeason, loadedSeasons, id]);

  // 👉 quando o user clica em "Ver Episódio"
  async function handleWatchEpisode(seasonNumber, episodeNumber) {
    // grava no Supabase
    await touchEpisodeProgress(id, seasonNumber, episodeNumber, {
      status: "in_progress",
      estimated_duration_seconds: 1500,
    });

    // vai ver
    router.push(
      `/watch/series/${id}/season/${seasonNumber}/episode/${episodeNumber}`
    );
  }

  if (loading) return <p className="text-white p-6">Carregando série...</p>;
  if (!series) return <p className="text-white p-6">Série não encontrada.</p>;

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle seriesTitle={series.name} />

      <div className="px-6 py-6 max-w-6xl mx-auto pt-24">
        {/* cabeçalho */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={`https://image.tmdb.org/t/p/w300${series.poster_path}`}
            alt={series.name}
            className="rounded-md object-cover shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-3">{series.name}</h1>
            <p className="text-gray-300">
              {series.overview || "Sem sinopse disponível."}
            </p>
            <p className="mt-2 text-sm text-gray-400">
              ⭐ Avaliação: {series.vote_average?.toFixed(1) || "N/A"}
            </p>
          </div>
        </div>

        {/* temporadas */}
        <div>
          {seasons.map((season) => (
            <div
              key={season.id}
              className="mb-4 border border-gray-800 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => handleToggleSeason(season.season_number)}
                className="w-full flex justify-between items-center px-4 py-3 bg-gray-900 hover:bg-gray-800 transition"
              >
                <span className="font-semibold">{season.name}</span>
                <span className="text-gray-400">
                  {openSeason === season.season_number ? "▲" : "▼"}
                </span>
              </button>

              {openSeason === season.season_number && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-950">
                  {loadedSeasons[season.season_number]?.episodes ? (
                    loadedSeasons[season.season_number].episodes.map((ep) => {
                      const linkFromDb =
                        embedMapBySeason[season.season_number]?.[
                          ep.episode_number
                        ] || null;
                      const linkFromFallback =
                        STREAMING_LINKS[id]?.[season.season_number]?.[
                          ep.episode_number
                        ] || null;
                      const link = linkFromDb || linkFromFallback;
                      const done =
                        doneMap[season.season_number]?.[ep.episode_number] ||
                        false;

                      return (
                        <div
                          key={ep.id}
                          className="bg-gray-900 p-3 rounded-lg hover:bg-gray-800 transition"
                        >
                          <p className="font-semibold mb-1 flex items-center gap-2">
                            {ep.episode_number}. {ep.name}
                            {done && (
                              <span className="text-green-400 text-xs border border-green-600/60 rounded px-2 py-0.5">
                                ✓ Visto
                              </span>
                            )}
                          </p>
                          <p className="text-gray-400 text-sm mb-2 line-clamp-3">
                            {ep.overview || "Sem descrição."}
                          </p>

                          {link ? (
                            <button
                              onClick={() =>
                                handleWatchEpisode(
                                  season.season_number,
                                  ep.episode_number
                                )
                              }
                              className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                            >
                              ▶ Ver Episódio
                            </button>
                          ) : (
                            <span className="text-gray-500 italic text-sm">
                              Ainda não disponível
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 italic">
                      Carregando episódios...
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
