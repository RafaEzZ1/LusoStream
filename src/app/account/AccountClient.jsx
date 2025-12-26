"use client";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import VideoCard from "@/components/VideoCard";
// CORREÇÃO: Removidas as chavetas porque a exportação é default
import SkeletonLoader from "@/components/SkeletonLoader"; 
import { FaBookmark, FaUser, FaEnvelope } from "react-icons/fa";

export default function AccountClient() {
  const { user, profile } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      if (!profile?.watchlist || profile.watchlist.length === 0) {
        setWatchlistItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const promises = profile.watchlist.map(async (item) => {
          // Separar o prefixo (tv_ ou movie_) do ID
          const [prefix, id] = item.split("_");
          
          // Se não houver prefixo, assume movie; se houver 'tv', usa tv
          const type = prefix === "tv" ? "tv" : "movie";
          const mediaId = id || prefix; 

          const res = await fetch(
            `https://api.themoviedb.org/3/${type}/${mediaId}?api_key=f0bde271cd8fdf3dea9cd8582b100a8e&language=pt-BR`
          );
          
          if (!res.ok) return null;
          const data = await res.json();
          
          return {
            ...data,
            id: mediaId,
            // Normaliza para as tuas rotas internas
            type: type === "tv" ? "series" : "movie", 
            title: data.title || data.name,
            release_date: data.release_date || data.first_air_date
          };
        });

        const results = await Promise.all(promises);
        setWatchlistItems(results.filter((item) => item !== null));
      } catch (error) {
        console.error("Erro ao carregar watchlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, [profile?.watchlist]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* PERFIL */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold flex items-center justify-center md:justify-start gap-2">
               {profile?.username || "Utilizador"}
            </h1>
            <p className="text-zinc-500 flex items-center justify-center md:justify-start gap-2 mt-1">
              <FaEnvelope className="text-xs" /> {user.email}
            </p>
          </div>
        </section>

        {/* MINHA LISTA */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-purple-600 rounded-full" />
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaBookmark className="text-purple-500" /> A Minha Lista
            </h2>
            <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-lg">
              {watchlistItems.length}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => <SkeletonLoader key={i} />)}
            </div>
          ) : watchlistItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watchlistItems.map((item) => (
                <VideoCard 
                  key={`${item.type}-${item.id}`} 
                  video={item} 
                  type={item.type} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-800">
              <p className="text-zinc-500">A tua lista está vazia.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}