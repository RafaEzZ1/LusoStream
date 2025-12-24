"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getEpisodeEmbed } from "@/lib/embeds";
import { markAsWatching, markAsFinished } from "@/lib/progress";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
import { useAuthModal } from "@/context/AuthModalContext";

export const dynamic = "force-dynamic";

export default function WatchEpisodePage() {
  const { id, season, episode } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [user, setUser] = useState(null);
  
  const { openModal } = useAuthModal();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const embed = await getEpisodeEmbed(id, season, episode);
      setUrl(embed);
      setLoading(false);

      if (user && embed) {
        markAsWatching(id, "series", 10, season, episode);
      }
    }
    load();
  }, [id, season, episode]);

  async function handleMarkDone() {
    if (!user) { openModal(); return; }
    await markAsFinished(id, "series", season, episode);
    setIsFinished(true);
  }

  function handleNext() {
    if(user) markAsFinished(id, "series", season, episode);
    router.push(`/watch/series/${id}/season/${season}/episode/${parseInt(episode) + 1}`);
  }

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">A carregar episódio...</div>;
  if (!url) return <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center gap-4"><p>Episódio indisponível.</p><Link href={`/series/${id}`} className="bg-gray-800 px-4 py-2 rounded">Voltar</Link></div>;

  return (
    <div className="bg-black min-h-screen flex flex-col pt-20">
      
      <div className="w-full h-full flex-1 relative bg-black">
         <Link href={`/series/${id}`} className="absolute top-4 left-4 z-40 bg-black/60 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2">
          <span>← Voltar à Série</span>
        </Link>
        <div className="w-full aspect-video md:h-[85vh]">
          <iframe src={url} className="w-full h-full border-0" allowFullScreen />
        </div>
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-4 md:p-6 flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-sm md:text-lg mb-1">T{season} : Episódio {episode}</h1>
          <ReportButton itemId={id} itemType="series" season={season} episode={episode} />
        </div>
        <div className="flex gap-3">
          <button onClick={handleMarkDone} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isFinished ? "text-green-400 bg-green-900/20 border border-green-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
            {isFinished ? "✓ Visto" : "Marcar Visto"}
          </button>
          <button onClick={handleNext} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition shadow-lg flex items-center gap-2">
            Próximo <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}