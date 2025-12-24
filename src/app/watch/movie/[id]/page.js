// src/app/watch/movie/[id]/page.js
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // <--- ATUALIZADO
import { getMovieEmbed } from "@/lib/embeds";
import { markAsWatching, markAsFinished } from "@/lib/progress";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
import { useAuthModal } from "@/context/AuthModalContext";

export const dynamic = "force-dynamic";

export default function WatchMoviePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient(); // <--- INSTÂNCIA

  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [user, setUser] = useState(null);
  
  const { openModal } = useAuthModal();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      const embed = await getMovieEmbed(id);
      setUrl(embed);
      setLoading(false);

      if (user && embed) {
        markAsWatching(user, "movie", id);
        const { data } = await supabase.from("user_progress").select("status").eq("user_id", user.id).eq("item_type", "movie").eq("item_id", id).maybeSingle();
        if (data?.status === "finished") setIsFinished(true);
      }
    }
    load();
  }, [id]);

  async function toggleFinished() {
    if (!user) {
      openModal();
      return;
    }
    
    if (!isFinished) {
      await markAsFinished(user, "movie", id);
      setIsFinished(true);
    } else {
      await markAsWatching(user, "movie", id);
      setIsFinished(false);
    }
  }

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">A carregar...</div>;
  if (!url) return <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center gap-4"><p>Indisponível.</p><Link href={`/movies/${id}`} className="bg-gray-800 px-4 py-2 rounded">Voltar</Link></div>;

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Link href={`/movies/${id}`} className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10">← Voltar</Link>
      <div className="flex-1 w-full h-full relative"><iframe src={url} className="w-full h-full absolute inset-0 border-0" allowFullScreen /></div>
      <div className="bg-gray-900 border-t border-gray-800 p-4 flex justify-between items-center">
        <div className="flex flex-col gap-1">
           <span className="text-white font-medium opacity-80">A ver o filme...</span>
           <ReportButton itemId={id} itemType="movie" />
        </div>
        <button onClick={toggleFinished} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isFinished ? "bg-green-600/20 text-green-400 border border-green-600/50" : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
          {isFinished ? "✅ Visto" : "⭕ Marcar Visto"}
        </button>
      </div>
    </div>
  );
}