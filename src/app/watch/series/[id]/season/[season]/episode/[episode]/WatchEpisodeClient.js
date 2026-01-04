"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import VideoPlayer from "@/components/VideoPlayer";

export default function WatchEpisodeClient({ id, season, episode }) {
  const [links, setLinks] = useState(null); 
  const [seriesData, setSeriesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEpisodeData() {
      try {
        const q = query(collection(db, "content"), where("tmdbId", "==", id));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setSeriesData(data); 

          // Lógica para buscar o episódio específico
          const episodeKey = `S${season}_E${episode}`;
          const specificEpisode = data.episodes?.[episodeKey];

          if (specificEpisode) {
            setLinks(specificEpisode);
          }
        }
      } catch (e) { 
        console.error("Erro ao carregar episódio:", e); 
      } finally { 
        setLoading(false); 
      }
    }

    if (id && season && episode) getEpisodeData();
  }, [id, season, episode]);

  const nextEp = Number(episode) + 1;

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div></div>;
  
  if (!links) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-2xl font-bold">Episódio Indisponível</h1>
        <p className="text-zinc-500">Ainda não foram adicionados links para a Temporada {season}, Episódio {episode}.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="relative w-full pt-20 md:pt-24 bg-black shadow-2xl px-4 md:px-0">
         <div className="max-w-7xl mx-auto">
            <VideoPlayer server1={links.server1} server2={links.server2} />
         </div>
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-purple-500 font-bold text-xs uppercase tracking-widest">
              {seriesData?.title || `Série ${id}`}
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight">
              Temporada {season} • Episódio {episode}
            </h1>
          </div>
          <ReportButton mediaId={id} mediaTitle={`Série ${id} S${season}E${episode}`} />
        </div>
        <PlayerControls 
          mediaId={id} type="tv" 
          season={season} episode={episode}
          backLink={`/series/${id}`}
          nextEpisodeLink={`/watch/series/${id}/season/${season}/episode/${nextEp}`}
        />
      </div>
      <ProgressTracker mediaId={id} type="tv" season={season} episode={episode} duration={2700} />
    </div>
  );
}