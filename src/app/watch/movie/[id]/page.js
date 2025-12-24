"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMovieEmbed } from "@/lib/embeds";
import { markAsWatching, markAsFinished } from "@/lib/progress";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
import { useAuthModal } from "@/context/AuthModalContext";

// NÃO IMPORTES A NAVBAR AQUI! ELA JÁ VEM DO LAYOUT.

export const dynamic = "force-dynamic";

export default function WatchMoviePage() {
  const { id } = useParams();
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
      const embed = await getMovieEmbed(id);
      setUrl(embed);
      setLoading(false);

      if (user && embed) {
        markAsWatching(id, "movie", 10); 
        const { data } = await supabase.from("continue_watching").select("progress_percent").eq("user_id", user.id).eq("item_type", "movie").eq("item_id", id).maybeSingle();
        if (data?.progress_percent === 100) setIsFinished(true);
      }
    }
    load();
  }, [id]);

  async function toggleFinished() {
    if (!user) { openModal(); return; }
    
    if (!isFinished) {
      await markAsFinished(id, "movie");
      setIsFinished(true);
    } else {
      await markAsWatching(id, "movie", 10);
      setIsFinished(false);
    }
  }

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">A carregar filme...</div>;
  if (!url) return <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center gap-4"><p>Filme indisponível.</p><Link href={`/movies/${id}`} className="bg-gray-800 px-4 py-2 rounded">Voltar</Link></div>;

  return (
    <div className="bg-black min-h-screen flex flex-col pt-20"> {/* PT-20 é essencial para não ficar escondido atrás da Navbar do Layout */}
      
      <div className="w-full h-full flex-1 relative bg-black">
         <Link href={`/movies/${id}`} className="absolute top-4 left-4 z-40 bg-black/60 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 transition-all">
          <span>← Voltar</span>
        </Link>
        <div className="w-full aspect-video md:h-[85vh]">
           <iframe src={url} className="w-full h-full border-0" allowFullScreen />
        </div>
      </div>
      
      <div className="bg-gray-900 border-t border-gray-800 p-4 md:p-6 flex justify-between items-center">
        <div className="flex flex-col gap-1">
           <span className="text-white font-medium opacity-80 text-sm md:text-base">A reproduzir...</span>
           <ReportButton itemId={id} itemType="movie" />
        </div>
        <button onClick={toggleFinished} className={`px-6 py-3 rounded-lg font-bold text-sm transition flex items-center gap-2 ${isFinished ? "bg-green-600/20 text-green-400 border border-green-600/50" : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
          {isFinished ? "✅ Visto" : "⭕ Marcar Visto"}
        </button>
      </div>
    </div>
  );
}