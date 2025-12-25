"use client";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MediaRow from "@/components/MediaRow"; // Assume que tens este componente
// Se precisares de buscar detalhes dos filmes da watchlist, terás de usar a API do TMDB aqui
// Mas para já, vamos focar no básico.

export default function AccountClient() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho do Perfil */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl font-bold text-white">
            {profile?.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile?.name || "Membro LusoStream"}
            </h1>
            <p className="text-gray-400 mb-4">{user.email}</p>
            <div className="flex gap-3 justify-center md:justify-start">
               {profile?.role === 'admin' && (
                 <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                   ADMIN
                 </span>
               )}
               <button 
                 onClick={signOut}
                 className="px-4 py-1 rounded-full border border-white/20 text-sm hover:bg-white/10 transition"
               >
                 Terminar Sessão
               </button>
            </div>
          </div>
        </div>

        {/* Watchlist Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-purple-500 pl-4">
            A Minha Lista ({profile?.watchlist?.length || 0})
          </h2>
          
          {profile?.watchlist?.length > 0 ? (
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-gray-400">
                Tens {profile.watchlist.length} filmes/séries na lista. 
                (Nota: A visualização da lista precisa de ser ligada ao TMDB, faremos isso no próximo passo).
              </p>
            </div>
          ) : (
            <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5">
              <p className="text-gray-400">Ainda não adicionaste nada à tua lista.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}