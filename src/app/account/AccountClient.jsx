"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SkeletonLoader from "@/components/SkeletonLoader"; // Importação default corrigida
import { FaBookmark, FaUser, FaEnvelope } from "react-icons/fa";

const fetchDetails = async (itemFullId) => {
  try {
    // Separa o prefixo (tv_ ou movie_) do ID real
    const parts = String(itemFullId).split("_");
    const type = parts.length > 1 ? parts[0] : 'movie';
    const id = parts.length > 1 ? parts[1] : parts[0];

    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=f0bde271cd8fdf3dea9cd8582b100a8e&language=pt-PT`
    );
    
    if (!res.ok) return null;
    const data = await res.json();
    
    // Garante que o media_type está presente para gerar o Link correto
    return { ...data, media_type: type }; 
  } catch (e) {
    return null;
  }
};

export default function AccountClient() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    async function loadWatchlist() {
      if (profile?.watchlist?.length > 0) {
        setLoadingList(true);
        const promises = profile.watchlist.map(id => fetchDetails(id));
        const results = await Promise.all(promises);
        setWatchlistItems(results.filter(item => item !== null));
        setLoadingList(false);
      } else {
        setWatchlistItems([]);
        setLoadingList(false);
      }
    }
    
    if (profile?.watchlist) loadWatchlist();
  }, [profile?.watchlist]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 md:px-8 pb-20 text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Perfil */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile?.username || "Utilizador"}</h1>
            <p className="text-zinc-500">{user.email}</p>
            <button onClick={signOut} className="mt-4 text-xs bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition">
              Terminar Sessão
            </button>
          </div>
        </section>

        {/* Watchlist */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold border-l-4 border-purple-500 pl-4 flex items-center gap-2">
            A Minha Lista <span className="text-zinc-600 font-normal">({watchlistItems.length})</span>
          </h2>
          
          {loadingList ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <SkeletonLoader key={i} />)}
            </div>
          ) : watchlistItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {watchlistItems.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.media_type === "tv" ? `/series/${item.id}` : `/movies/${item.id}`}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-purple-500 transition-all"
                >
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-zinc-700">Sem Capa</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-xs font-bold truncate">{item.title || item.name}</p>
                    <p className="text-[10px] text-purple-400 uppercase">{item.media_type === 'tv' ? 'Série' : 'Filme'}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <p className="text-zinc-500">A tua lista está vazia.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}