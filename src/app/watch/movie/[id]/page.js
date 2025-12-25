"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getMovieEmbed } from "@/lib/embeds";
import { markAsFinished, saveVideoProgress } from "@/lib/progress";
import Link from "next/link";
import ReportButton from "@/components/ReportButton";
import { useAuthModal } from "@/context/AuthModalContext";
import { useAuth } from "@/components/AuthProvider";

export const dynamic = "force-dynamic";

export default function WatchMoviePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  
  // Timer para salvar progresso
  useEffect(() => {
    async function load() {
      const embed = await getMovieEmbed(id);
      setUrl(embed);
      setLoading(false);
    }
    load();

    // Guardar progresso a cada 15 segundos (simulado, pois iframe não dá tempo exato)
    let interval;
    if (user && id) {
       let seconds = 0;
       interval = setInterval(() => {
         seconds += 15;
         // Assume 2h de filme (7200s) como base para percentagem
         saveVideoProgress(user.uid, id, seconds, 7200, "movie");
       }, 15000);
    }
    return () => clearInterval(interval);
  }, [id, user]);

  async function toggleFinished() {
    if (!user) { openModal(); return; }
    await markAsFinished(user.uid, id, "movie");
    setIsFinished(true);
  }

  if (loading) return <div className="bg-black min-h-screen text-white flex items-center justify-center">A carregar...</div>;
  if (!url) return <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center gap-4"><p>Indisponível.</p><Link href={`/movies/${id}`} className="bg-gray-800 px-4 py-2 rounded">Voltar</Link></div>;

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <Link href={`/movies/${id}`} className="absolute top-4 left-4 z-50 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md border border-white/10">← Voltar</Link>
      
      <div className="flex-1 w-full h-full relative">
        <iframe src={url} className="w-full h-full absolute inset-0 border-0" allowFullScreen />
      </div>

      <div className="bg-gray-900 border-t border-gray-800 p-4 flex justify-between items-center">
        <div className="flex flex-col gap-1">
           <span className="text-white font-medium opacity-80">A ver o filme...</span>
           <ReportButton mediaId={id} mediaTitle={`Filme #${id}`} />
        </div>
        <button onClick={toggleFinished} className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isFinished ? "bg-green-600/20 text-green-400 border border-green-600/50" : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
          {isFinished ? "✅ Visto" : "⭕ Marcar Visto"}
        </button>
      </div>
    </div>
  );
}