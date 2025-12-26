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

  // Função para Marcar como Visto
  const handleMarkAsWatched = async () => {
    if (!user) return toast.error("Precisas de estar logado.");
    
    setLoading(true);
    try {
      // Marca como 100% visto (o que o remove da lista de continuar a ver)
      await markAsFinished(user.uid, mediaId, type, season, episode);
      toast.success("Marcado como visto!");
      router.refresh(); // Atualiza a página
      router.push("/"); // Volta à Home
    } catch (error) {
      console.error(error);
      toast.error("Erro ao marcar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      
      {/* Botão Voltar */}
      <a 
        href={backLink}
        className="bg-black/60 hover:bg-purple-600 text-white px-4 py-2 rounded-lg backdrop-blur-md transition flex items-center gap-2 font-bold text-sm"
      >
        <FaArrowLeft /> Voltar
      </a>

      {/* Botão Marcar como Visto */}
      <button 
        onClick={handleMarkAsWatched}
        disabled={loading}
        className="bg-black/60 hover:bg-green-600 text-white px-4 py-2 rounded-lg backdrop-blur-md transition flex items-center gap-2 font-bold text-sm"
      >
        <FaCheck /> {loading ? "A marcar..." : "Já Vi"}
      </button>

      {/* Botão Próximo Episódio (Só aparece se passares o link) */}
      {nextEpisodeLink && (
        <a 
          href={nextEpisodeLink}
          className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg backdrop-blur-md transition flex items-center gap-2 font-bold text-sm shadow-lg shadow-purple-900/50"
        >
          Próximo <FaStepForward />
        </a>
      )}
    </div>
  );
}