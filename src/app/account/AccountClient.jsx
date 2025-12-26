"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import SkeletonLoader from "@/components/SkeletonLoader"; 
import { FaBookmark, FaUser, FaEnvelope, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";

// Função para buscar detalhes corrigida para os novos IDs (tv_123 ou movie_123)
const fetchDetails = async (itemFullId) => {
  try {
    const parts = String(itemFullId).split("_");
    const type = parts.length > 1 ? parts[0] : 'movie';
    const id = parts.length > 1 ? parts[1] : parts[0];

    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=f0bde271cd8fdf3dea9cd8582b100a8e&language=pt-PT`
    );
    
    if (!res.ok) return null;
    const data = await res.json();
    return { ...data, media_type: type, id: id }; 
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

  const handleDeleteAccount = async () => {
    const confirmFirst = confirm("AVISO CRÍTICO: Queres mesmo apagar a tua conta? Todos os teus dados serão eliminados para sempre.");
    if (!confirmFirst) return;

    const confirmSecond = prompt("Para confirmar, escreve 'ELIMINAR' abaixo:");
    if (confirmSecond !== "ELIMINAR") return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      toast.success("Conta eliminada.");
      router.push("/");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        toast.error("Por segurança, faz logout e login novamente antes de apagar a conta.");
      } else {
        toast.error("Erro ao eliminar conta.");
      }
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 md:px-8 pb-20 text-white">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Perfil */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
            {profile?.username?.[0].toUpperCase() || user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile?.username || "Utilizador"}</h1>
            <p className="text-zinc-500">{user.email}</p>
            <button onClick={signOut} className="mt-4 text-xs bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition">
              Terminar Sessão
            </button>
          </div>
        </section>

        {/* Minha Lista */}
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
                  key={`${item.media_type}-${item.id}`} 
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
                    <div className="flex h-full items-center justify-center text-zinc-700 italic">Sem Capa</div>
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

        {/* Zona de Perigo */}
        <section className="pt-10 border-t border-red-900/30">
          <div className="bg-red-900/10 border border-red-900/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-red-500 font-bold flex items-center gap-2">
                <FaTrashAlt /> Eliminar Conta
              </h3>
              <p className="text-zinc-500 text-sm mt-1">Ao apagar a conta, perderás permanentemente a tua lista e o teu progresso.</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              Apagar Tudo
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}