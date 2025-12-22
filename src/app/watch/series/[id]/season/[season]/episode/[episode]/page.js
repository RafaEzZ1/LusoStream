// src/app/watch/series/[id]/season/[season]/episode/[episode]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getEpisodeEmbed } from "@/lib/embeds";
import { markAsWatching, markAsFinished } from "@/lib/progress";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
// 👇 Importar Modal
import { useAuthModal } from "@/context/AuthModalContext";

export const dynamic = "force-dynamic";

export default function WatchEpisodePage() {
  const { id, season, episode } = useParams();
  const router = useRouter();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [user, setUser] = useState(null);
  
  // 👇 Usar Hook
  const { openModal } = useAuthModal();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const embed = await getEpisodeEmbed(id, season, episode);
      setUrl(embed);
      setLoading(false);

      if (user && embed) {
        markAsWatching(user, "series", id, season, episode);
        const { data } = await supabase.from("user_progress").select("status").eq("user_id", user.id).eq("item_type", "series").eq("item_id", id).eq("season", season).eq("episode", episode).maybeSingle();
        if (data?.status === "finished") setIsFinished(true);
      }
    }
    load();
  }, [id, season, episode]);

  async function handleMarkDone() {
    // 👇 SE NÃO TIVER USER, POP-UP
    if (!user) {
      openModal();
      return;
    }
    await markAsFinished(user, "series", id, season, episode);
    setIsFinished(true);
  }

  function handleNext() {
    if(user) markAsFinished(user, "series", id, season, episode);
    router.push(`/watch/series/${id}/season/${season}/episode/${parseInt(episode) + 1}`);
  }

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">A carregar...</div>;
  if (!url) return <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center gap-4"><p>Indisponível.</p><Link href={`/series/${id}`} className="bg-gray-800 px-4 py-2 rounded">Voltar</Link></div>;

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Link href={`/series/${id}`} className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10">← Voltar</Link>
      <div className="flex-1 w-full h-full relative"><iframe src={url} className="w-full h-full absolute inset-0 border-0" allowFullScreen /></div>
      <div className="bg-gray-900 border-t border-gray-800 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-sm md:text-base">T{season} : E{episode}</h1>
          <ReportButton itemId={id} itemType="series" season={season} episode={episode} />
        </div>
        <div className="flex gap-3">
          <button onClick={handleMarkDone} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isFinished ? "text-green-400" : "text-gray-400 hover:text-white"}`}>
            {isFinished ? "✓ Visto" : "Marcar Visto"}
          </button>
          <button onClick={handleNext} className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition shadow-lg">Próximo →</button>
        </div>
      </div>
    </div>
  );
}