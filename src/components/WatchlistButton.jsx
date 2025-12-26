"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/context/AuthModalContext";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase";
import toast from 'react-hot-toast';
import { FaCheck, FaPlus } from "react-icons/fa";

export default function WatchlistButton({ mediaId, mediaType = "movie" }) {
  const { user, profile } = useAuth();
  const { openModal } = useAuthModal();
  const [loading, setLoading] = useState(false);
  
  // ID com prefixo para evitar confusão entre filmes e séries
  const typeKey = mediaType === 'tv' || mediaType === 'series' ? 'tv' : 'movie';
  const itemFullId = `${typeKey}_${mediaId}`;
  
  const [isAdded, setIsAdded] = useState(false);

  // Sincroniza o estado inicial com o perfil do utilizador
  useEffect(() => {
    if (profile?.watchlist) {
      setIsAdded(profile.watchlist.includes(itemFullId));
    }
  }, [profile?.watchlist, itemFullId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      openModal();
      return;
    }

    setLoading(true);
    // Mudança optimista: assume que vai correr bem para UX rápida
    const previousState = isAdded;
    setIsAdded(!previousState);

    try {
      if (!previousState) {
        await addToWatchlist(user.uid, itemFullId);
        toast.success("Adicionado à Minha Lista!");
      } else {
        await removeFromWatchlist(user.uid, itemFullId);
        toast("Removido da lista", { icon: '🗑️' });
      }
      // NOTA: Se o teu AuthProvider não atualizar o profile automaticamente, 
      // podes precisar de um window.location.reload() ou router.refresh() aqui.
    } catch (error) {
      console.error("Erro watchlist:", error);
      toast.error("Erro ao guardar.");
      setIsAdded(previousState); // Reverte se falhar
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 ${
        isAdded 
          ? "bg-green-600 text-white border border-green-500" 
          : "bg-white/10 text-white border border-white/10 hover:bg-white/20"
      }`}
    >
      {isAdded ? <FaCheck size={12} /> : <FaPlus size={12} />}
      <span>{isAdded ? "Na Lista" : "Minha Lista"}</span>
    </button>
  );
}