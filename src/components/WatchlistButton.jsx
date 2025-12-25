"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider"; // Usa o contexto novo
import { useAuthModal } from "@/context/AuthModalContext";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase"; // Funções novas

export default function WatchlistButton({ mediaId, mediaType = "movie" }) {
  const { user, profile } = useAuth(); // O profile já traz a watchlist!
  const { openModal } = useAuthModal();
  const [loading, setLoading] = useState(false);

  // Verifica se está na lista (o profile.watchlist é um array de IDs)
  const isInWatchlist = profile?.watchlist?.includes(String(mediaId));

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      openModal();
      return;
    }

    setLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(user.uid, String(mediaId));
      } else {
        await addToWatchlist(user.uid, String(mediaId));
      }
      // Não precisamos de atualizar estado local complexo, 
      // o AuthProvider atualiza automaticamente via WebSockets!
    } catch (error) {
      console.error("Erro watchlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        isInWatchlist
          ? "bg-white text-black hover:bg-gray-200"
          : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
      }`}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isInWatchlist ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          <span>Na Lista</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          <span>Minha Lista</span>
        </>
      )}
    </button>
  );
}