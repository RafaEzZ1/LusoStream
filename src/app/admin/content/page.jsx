"use client";
import { useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb";
import toast from "react-hot-toast";
import { FaSearch, FaPlus, FaServer, FaFilm, FaTv } from "react-icons/fa";

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [server1, setServer1] = useState("");
  const [server2, setServer2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMulti(searchQuery);
      setResults(data.results || []);
    } catch (error) {
      toast.error("Erro na pesquisa.");
    }
  };

  const handleAddContent = async () => {
    if (!selectedMedia || !server1) return toast.error("Preenche pelo menos o Servidor 1!");
    setLoading(true);
    try {
      await addDoc(collection(db, "content"), {
        tmdbId: selectedMedia.id.toString(),
        title: selectedMedia.title || selectedMedia.name,
        type: selectedMedia.media_type,
        poster_path: selectedMedia.poster_path,
        backdrop_path: selectedMedia.backdrop_path,
        server1: server1,
        server2: server2 || "", 
        embedUrl: server1, // Mantemos para compatibilidade
        createdAt: serverTimestamp(),
      });
      toast.success("Conteúdo adicionado com sucesso!");
      setSelectedMedia(null);
      setServer1("");
      setServer2("");
      setResults([]);
      setSearchQuery("");
    } catch (error) {
      toast.error("Erro ao guardar no Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminClient>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white">
            GESTOR DE <span className="text-purple-600">CONTEÚDO</span>
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">
            Adiciona novos filmes e séries à plataforma
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <form onSubmit={handleSearch} className="relative group">
          <input
            className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl px-8 py-6 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all text-white placeholder:text-zinc-600"
            placeholder="Pesquisar no catálogo global (TMDB)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 p-4 rounded-2xl text-white transition-all active:scale-95 shadow-lg shadow-purple-900/20"
          >
            <FaSearch size={18} />
          </button>
        </form>

        {/* Resultados da Pesquisa */}
        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 animate-in fade-in duration-500">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className={`group relative aspect-[2/3] rounded-2xl overflow-hidden border-2 transition-all ${
                  selectedMedia?.id === item.id 
                  ? 'border-purple-600 ring-4 ring-purple-600/20 scale-95' 
                  : 'border-white/5 hover:border-purple-600/50'
                }`}
              >
                {item.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-bold uppercase text-[10px]">Sem Capa</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-left">
                  <p className="text-white font-bold text-[10px] truncate uppercase">{item.title || item.name}</p>
                  <p className="text-zinc-400 text-[8px] font-black uppercase tracking-tighter flex items-center gap-1">
                    {item.media_type === 'movie' ? <FaFilm size={8}/> : <FaTv size={8}/>} {item.media_type}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Formulário de Configuração (Aparece ao selecionar) */}
        {selectedMedia && (
          <div className="bg-zinc-900/80 border border-white/10 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-32 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/10">
                <img src={`https://image.tmdb.org/t/p/w342${selectedMedia.poster_path}`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-white">{selectedMedia.title || selectedMedia.name}</h2>
                  <p className="text-zinc-500 text-sm italic line-clamp-2 mt-2">{selectedMedia.overview}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest flex items-center gap-2">
                      <FaServer className="text-purple-600" /> Servidor 1 (MixDrop)
                    </label>
                    <input
                      className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-purple-600 transition-all placeholder:text-zinc-800"
                      value={server1}
                      onChange={(e) => setServer1(e.target.value)}
                      placeholder="Cole o link do MixDrop aqui..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-purple-600 ml-2 tracking-widest flex items-center gap-2">
                      <FaServer /> Servidor 2 (UpStream / Opcional)
                    </label>
                    <input
                      className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-purple-600 transition-all placeholder:text-zinc-800"
                      value={server2}
                      onChange={(e) => setServer2(e.target.value)}
                      placeholder="Cole o link secundário aqui..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleAddContent}
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-purple-900/20"
                  >
                    {loading ? "A PROCESSAR..." : "PUBLICAR NA PLATAFORMA"}
                  </button>
                  <button 
                    onClick={() => setSelectedMedia(null)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-5 rounded-2xl font-black transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminClient>
  );
}