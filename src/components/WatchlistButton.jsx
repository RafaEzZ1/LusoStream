"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/context/AuthModalContext";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase";
import toast from 'react-hot-toast'; // <--- Notificações
import { FaCheck, FaPlus } from "react-icons/fa"; // <--- Ícones (se tiveres react-icons)

export default function WatchlistButton({ mediaId, mediaType = "movie" }) {
  const { user, profile } = useAuth();
  const { openModal } = useAuthModal();
  const [loading, setLoading] = useState(false);
  
  // Estado local para resposta imediata (Optimistic UI)
  const [isAdded, setIsAdded] = useState(false);

  // Sincroniza com o perfil real quando ele carrega/muda
  useEffect(() => {
    if (profile?.watchlist) {
      setIsAdded(profile.watchlist.includes(String(mediaId)));
    }
  }, [profile, mediaId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openModal();
      return;
    }

    // 1. Muda visualmente IMEDIATAMENTE (antes de ir ao servidor)
    const newState = !isAdded;
    setIsAdded(newState);

    // 2. Notificação visual
    if (newState) {
      toast.success("Adicionado à Minha Lista!", { icon: '✅' });
    } else {
      toast("Removido da lista", { icon: '🗑️' });
    }

    setLoading(true);

    try {
      // 3. Envia para o Firebase em segundo plano
      if (newState) { // Se o novo estado é "Adicionado"
        await addToWatchlist(user.uid, String(mediaId));
      } else {
        await removeFromWatchlist(user.uid, String(mediaId));
      }
    } catch (error) {
      console.error("Erro watchlist:", error);
      toast.error("Erro ao guardar. Tenta de novo.");
      setIsAdded(!newState); // Reverte se der erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        relative flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-lg transition-all duration-300 transform active:scale-95
        ${isAdded 
          ? "bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] border border-green-500" 
          : "bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/30 backdrop-blur-md"
        }
      `}
    >
      {/* Ícone com animação de troca */}
      <span className={`transition-transform duration-300 ${isAdded ? "scale-100" : "scale-100"}`}>
        {isAdded ? <FaCheck /> : <FaPlus />}
      </span>
      
      <span>{isAdded ? "Na Lista" : "Minha Lista"}</span>

      {/* Efeito de Loading discreto se estiver a processar */}
      {loading && (
        <span className="absolute right-2 top-2 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></span>
      )}
    </button>
  );
}