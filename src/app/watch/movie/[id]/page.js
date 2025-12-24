"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getMovieEmbed } from "@/lib/embeds";
import { markAsWatching, markAsFinished } from "@/lib/progress";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
import { useAuthModal } from "@/context/AuthModalContext";

// NOTA: Não importes a Navbar aqui. Ela já está no layout.js

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
      // 1. Obter Utilizador (Tenta a sessão local primeiro para ser instantâneo)
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // 2. Obter Embed do Filme
      const embed = await getMovieEmbed(id);
      setUrl(embed);
      setLoading(false);

      // 3. Lógica de Progresso (Só se tiver user)
      if (currentUser && embed) {
        markAsWatching(id, "movie", 10); 
        
        const { data } = await supabase
          .from("continue_watching")
          .select("progress_percent")
          .eq("user_id", currentUser.id)
          .eq("item_type", "movie")
          .eq("item_id", id)
          .maybeSingle();
          
        if (data?.progress_percent === 100) setIsFinished(true);
      }
    }
    load();
  }, [id, supabase]);

  async function toggleFinished() {
    if (!user) {
      // Se clicou e não tem user, abre modal de login
      openModal(); 
      return;
    }
    
    if (!isFinished) {
      await markAsFinished(id, "movie");
      setIsFinished(true);
    } else {
      await markAsWatching(id, "movie", 10);
      setIsFinished(false);
    }
  }

  if (loading) return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div>
    </div>
  );

  if (!url) return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center gap-4 pt-20">
      <p>Filme indisponível.</p>
      <Link href={`/movies/${id}`} className="bg-gray-800 px-4 py-2 rounded">Voltar</Link>
    </div>
  );

  return (
    <div className="bg-black min-h-screen flex flex-col pt-20">
      
      {/* Área do Player */}
      <div className="w-full h-full flex-1 relative bg-black group">
         <Link href={`/movies/${id}`} className="absolute top-4 left-4 z-40 bg-black/60 hover:bg-black/90 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 transition-all opacity-0 group-hover:opacity-100 duration-300">
          <span>← Voltar</span>
        </Link>
        <div className="w-full aspect-video md:h-[85vh]">
           <iframe src={url} className="w-full h-full border-0" allowFullScreen />
        </div>
      </div>
      
      {/* Barra de Controlo Inferior */}
      <div className="bg-gray-900 border-t border-gray-800 p-4 md:p-6 flex justify-between items-center">
        <div className="flex flex-col gap-1">
           <span className="text-white font-medium opacity-80 text-sm md:text-base">A reproduzir...</span>
           <ReportButton itemId={id} itemType="movie" />
        </div>
        <button 
          onClick={toggleFinished} 
          className={`px-6 py-3 rounded-lg font-bold text-sm transition flex items-center gap-2 ${isFinished ? "bg-green-600/20 text-green-400 border border-green-600/50" : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"}`}
        >
          {isFinished ? "✅ Visto" : "⭕ Marcar Visto"}
        </button>
      </div>
    </div>
  );
}