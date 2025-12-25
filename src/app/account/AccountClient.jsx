"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Função para buscar detalhes de um item (Filme ou Série)
// Precisamos disto para saber o nome e a imagem correta
const fetchDetails = async (id, type = 'movie') => {
  try {
    // Tenta primeiro como filme
    let res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=f0bde271cd8fdf3dea9cd8582b100a8e&language=pt-PT`);
    
    // Se der erro (404), tenta como série
    if (!res.ok) {
      res = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=f0bde271cd8fdf3dea9cd8582b100a8e&language=pt-PT`);
    }
    
    if (!res.ok) return null;
    return await res.json();
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

  // Carrega os detalhes reais de cada item na lista
  useEffect(() => {
    async function loadWatchlist() {
      if (profile?.watchlist?.length > 0) {
        setLoadingList(true);
        // Busca todos os itens em paralelo
        const promises = profile.watchlist.map(id => fetchDetails(id));
        const results = await Promise.all(promises);
        // Filtra os que falharam (null)
        setWatchlistItems(results.filter(item => item !== null));
        setLoadingList(false);
      } else {
        setLoadingList(false);
      }
    }
    
    if (profile?.watchlist) {
      loadWatchlist();
    }
  }, [profile?.watchlist]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 md:px-8 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 p-8 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
            {profile?.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile?.name || "Membro LusoStream"}
            </h1>
            <p className="text-gray-400 mb-4">{user.email}</p>
            <div className="flex gap-3 justify-center md:justify-start items-center">
               {profile?.role === 'admin' && (
                 <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20 tracking-wider">
                   ADMIN
                 </span>
               )}
               <button 
                 onClick={signOut}
                 className="px-6 py-1.5 rounded-full bg-white/10 text-sm hover:bg-white/20 transition border border-white/5"
               >
                 Terminar Sessão
               </button>
            </div>
          </div>
        </div>

        {/* Watchlist Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-purple-500 pl-4 flex items-center gap-2">
            A Minha Lista <span className="text-gray-500 text-lg font-normal">({watchlistItems.length})</span>
          </h2>
          
          {loadingList ? (
             <div className="text-center py-20 text-gray-500 animate-pulse">A carregar a tua lista...</div>
          ) : watchlistItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {watchlistItems.map((item) => (
                <Link 
                  key={item.id} 
                  // DETECTA SE É FILME OU SÉRIE PELO CAMPO 'TITLE' (SÉRIES TÊM 'NAME')
                  href={item.title ? `/movies/${item.id}` : `/series/${item.id}`}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 hover:border-purple-500/50 transition-all duration-300"
                >
                  {item.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title || item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sem Capa</div>
                  )}
                  
                  {/* Overlay ao passar o rato */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm line-clamp-2">{item.title || item.name}</p>
                    <p className="text-xs text-purple-400 font-medium uppercase mt-1">
                      {item.title ? 'Filme' : 'Série'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-xl border border-white/5 border-dashed">
              <p className="text-gray-400 mb-4">Ainda não adicionaste nada à tua lista.</p>
              <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
                Explorar catálogo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}