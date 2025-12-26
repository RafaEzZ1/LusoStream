"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import ProgressSaver from "@/components/ProgressSaver";

export default function WatchSeriesPage() {
  const { id, season, episode } = useParams();
  const [episodeData, setEpisodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getEpisode() {
      try {
        // Busca baseada no ID da série, temporada e episódio
        const q = query(
          collection(db, "content"), 
          where("tmdbId", "==", id),
          where("season", "==", season),
          where("episode", "==", episode)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setEpisodeData(snapshot.docs[0].data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    getEpisode();
  }, [id, season, episode]);

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {episodeData ? (
          <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">
              {episodeData.title} - T{season}:E{episode}
            </h1>
            
            <VideoPlayer 
              server1={episodeData.server1 || episodeData.embedUrl} 
              server2={episodeData.server2} 
            />

            <ProgressSaver 
              mediaId={id} 
              mediaType="tv" 
              season={season} 
              episode={episode} 
            />
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 italic">
            Este episódio ainda não foi adicionado.
          </div>
        )}
      </main>
    </div>
  );
}