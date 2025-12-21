// src/app/watch/series/[id]/season/[season]/episode/[episode]/page.js
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DynamicTitle from "@/components/DynamicTitle";
import { getEpisodeEmbed } from "@/lib/embeds";
import { STREAMING_LINKS } from "@/lib/streamingLinks";
import { touchEpisodeProgress, markEpisodeFinished } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function WatchEpisodePage() {
  const params = useParams();
  const router = useRouter();

  const seriesId = params.id;
  const seasonNumber = Number(params.season);
  const episodeNumber = Number(params.episode);

  const [series, setSeries] = useState(null);
  const [embedLink, setEmbedLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const r = await fetch(
          `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${API_KEY}&language=pt-BR`
        );
        const d = await r.json();
        if (!cancelled) setSeries(d?.id ? d : null);

        const fromDb = await getEpisodeEmbed(seriesId, seasonNumber, episodeNumber);
        const fallback = STREAMING_LINKS[seriesId]?.[seasonNumber]?.[episodeNumber] || null;
        if (!cancelled) setEmbedLink(fromDb || fallback || null);

        // 👇 toca progresso no supabase
        await touchEpisodeProgress(seriesId, seasonNumber, episodeNumber, {
          status: "in_progress",
        });
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setSeries(null);
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
  }, [seriesId, seasonNumber, episodeNumber]);

  async function handleDone() {
    await markEpisodeFinished(seriesId, seasonNumber, episodeNumber);
    alert("Episódio marcado como concluído ✅");
  }

  function goToNextEpisode() {
    router.push(
      `/watch/series/${seriesId}/season/${seasonNumber}/episode/${episodeNumber + 1}`
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle
        pageTitle={
          series
            ? `${series.name} T${seasonNumber}E${episodeNumber} - LusoStream`
            : "Ver Episódio - LusoStream"
        }
      />

      <main className="pt-24 px-6 max-w-6xl mx-auto pb-10">
        <button onClick={() => router.back()} className="text-sm text-gray-300 hover:text-white">
          ← Voltar
        </button>

        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          {series ? `${series.name} — T${seasonNumber}E${episodeNumber}` : "Ver Episódio"}
        </h1>

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
                title={series?.name || "Player"}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDone}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Marcar como concluído
              </button>
              <button
                onClick={goToNextEpisode}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Próximo episódio →
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 bg-gray-900 p-6 rounded-lg border border-gray-800">
            <p className="text-red-500 text-lg font-semibold">
              Ainda não temos este episódio disponível.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
