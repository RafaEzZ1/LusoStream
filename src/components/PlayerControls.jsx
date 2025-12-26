"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { markAsFinished } from "@/lib/progress";
import { FaCheck, FaStepForward, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

export default function PlayerControls({ 
  mediaId, 
  type, 
  season, 
  episode, 
  nextEpisodeLink = null,
  backLink
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Função para Marcar como Visto e remover do "Continuar a Ver"
  const handleMarkAsWatched = async () => {
    if (!user) return toast.error("Precisas de estar logado.");
    
    setLoading(true);
    try {
      await markAsFinished(user.uid, mediaId, type, season, episode);
      toast.success("Marcado como visto!");
      // Pequeno delay para o toast ser lido antes de redirecionar
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao marcar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-2 md:flex md:flex-row gap-3">
      
      {/* Botão Voltar - Adaptado para Mobile */}
      <button 
        onClick={() => router.push(backLink)}
        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold text-sm active:scale-95"
      >
        <FaArrowLeft className="text-xs" /> Voltar
      </button>

      {/* Botão Marcar como Visto */}
      <button 
        onClick={handleMarkAsWatched}
        disabled={loading}
        className="flex-1 bg-zinc-800 hover:bg-green-600 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold text-sm active:scale-95 disabled:opacity-50"
      >
        <FaCheck className="text-xs" /> {loading ? "..." : "Já Vi"}
      </button>

      {/* Botão Próximo Episódio - Ocupa a largura toda no Mobile se existir */}
      {nextEpisodeLink && (
        <button 
          onClick={() => router.push(nextEpisodeLink)}
          className="col-span-2 md:flex-1 bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold text-sm active:scale-95 shadow-lg shadow-purple-900/20"
        >
          Próximo <FaStepForward className="text-xs" />
        </button>
      )}
    </div>
  );
}