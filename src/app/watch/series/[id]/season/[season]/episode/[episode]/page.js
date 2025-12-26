"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import VideoPlayer from "@/components/VideoPlayer"; // O novo player

export default function WatchEpisodePage() {
  const { id, season, episode } = useParams();
  const [epData, setEpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEpisode() {
      try {
        const q = query(
          collection(db, "content"), 
          where("tmdbId", "==", id),
          where("season", "==", season),
          where("episode", "==", episode)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) setEpData(snapshot.docs[0].data());
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    getEpisode();
  }, [id, season, episode]);

  const nextEp = Number(episode) + 1;

  if (loading) return <div className="min-h-screen bg-[#050505]" />;
  if (!epData) return <div className="p-20 text-center text-white">Episódio indisponível.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Container do Player */}
      <div className="relative w-full pt-20 md:pt-24 bg-black shadow-2xl px-4 md:px-0">
         <div className="max-w-7xl mx-auto">
            <VideoPlayer 
              server1={epData.server1 || epData.embedUrl} 
              server2={epData.server2} 
            />
         </div>
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-purple-500 font-bold text-xs uppercase tracking-widest">
              {epData.title || `Série ID: ${id}`}
            </span>
            <h1 className="text-xl font-black uppercase tracking-tight">
              T{season} • EP{episode}
            </h1>
          </div>
          <ReportButton mediaId={id} mediaTitle={`Série ${id} S${season}E${episode}`} />
        </div>

        {/* Os teus controlos originais */}
        <PlayerControls 
          mediaId={id} type="tv" 
          season={season} episode={episode}
          backLink={`/series/${id}`}
          nextEpisodeLink={`/watch/series/${id}/season/${season}/episode/${nextEp}`}
        />
      </div>

      {/* O teu tracker original */}
      <ProgressTracker mediaId={id} type="tv" season={season} episode={episode} duration={2700} />
    </div>
  );
}