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
  
  // Criar ID único com prefixo para não confundir
  const itemFullId = `${mediaType === 'tv' ? 'tv' : 'movie'}_${mediaId}`;
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (profile?.watchlist) {
      setIsAdded(profile.watchlist.includes(itemFullId));
    }
  }, [profile, itemFullId]);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (!user) { openModal(); return; }

    const newState = !isAdded;
    setIsAdded(newState);
    setLoading(true);

    try {
      if (newState) {
        await addToWatchlist(user.uid, itemFullId);
        toast.success("Adicionado à Minha Lista!");
      } else {
        await removeFromWatchlist(user.uid, itemFullId);
        toast("Removido da lista", { icon: '🗑️' });
      }
    } catch (error) {
      toast.error("Erro ao guardar.");
      setIsAdded(!newState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
        isAdded ? "bg-green-600 text-white" : "bg-white/10 text-white border border-white/10"
      }`}
    >
      {isAdded ? <FaCheck /> : <FaPlus />}
      <span>{isAdded ? "Na Lista" : "Minha Lista"}</span>
    </button>
  );
}