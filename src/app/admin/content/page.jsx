"use client";
import { useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb";
import toast from "react-hot-toast";
import { FaSearch, FaServer, FaFilm, FaTv, FaTrash, FaSave, FaExclamationCircle } from "react-icons/fa";

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Estados do Formulário
  const [server1, setServer1] = useState("");
  const [server2, setServer2] = useState("");
  const [existingId, setExistingId] = useState(null); // ID do documento no Firebase se já existir
  
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMulti(searchQuery);
      setResults(data.results || []);
      setSelectedMedia(null); // Reseta seleção ao pesquisar
    } catch (error) {
      toast.error("Erro na pesquisa.");
    }
  };

  // Função Inteligente: Verifica se já existe na base de dados
  const handleSelectMedia = async (item) => {
    setLoading(true);
    setSelectedMedia(item);
    setServer1("");
    setServer2("");
    setExistingId(null);

    try {
      // Procura no Firebase pelo tmdbId
      const q = query(collection(db, "content"), where("tmdbId", "==", item.id.toString()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // JÁ EXISTE: Carrega os dados para edição
        const docData = querySnapshot.docs[0];
        const data = docData.data();
        setExistingId(docData.id);
        setServer1(data.server1 || data.embedUrl || "");
        setServer2(data.server2 || "");
        toast("Este conteúdo já existe. Modo de Edição ativado.", { icon: "✏️" });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMedia || !server1) return toast.error("Preenche pelo menos o Servidor 1!");
    setLoading(true);

    const dataToSave = {
      tmdbId: selectedMedia.id.toString(),
      title: selectedMedia.title || selectedMedia.name,
      type: selectedMedia.media_type,
      poster_path: selectedMedia.poster_path,
      backdrop_path: selectedMedia.backdrop_path,
      server1: server1,
      server2: server2 || "", 
      embedUrl: server1, // Compatibilidade
      updatedAt: serverTimestamp(),
    };

    try {
      if (existingId) {
        // ATUALIZAR
        await updateDoc(doc(db, "content", existingId), dataToSave);
        toast.success("Links atualizados com sucesso!");
      } else {
        // CRIAR NOVO
        await addDoc(collection(db, "content"), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        toast.success("Conteúdo adicionado à plataforma!");
      }
      
      // Limpeza
      setSelectedMedia(null);
      setServer1("");
      setServer2("");
      setResults([]);
      setSearchQuery("");
    } catch (error) {
      toast.error("Erro ao guardar.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingId) return;
    if (!confirm(`Tens a certeza que queres APAGAR "${selectedMedia.title || selectedMedia.name}" do site?`)) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "content", existingId));
      toast.success("Conteúdo eliminado.");
      setSelectedMedia(null);
      setServer1("");
      setServer2("");
    } catch (error) {
      toast.error("Erro ao eliminar.");
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
            Adiciona, edita ou remove filmes e séries.
          </p>
        </div>

        {/* Barra de Pesquisa */}
        <form onSubmit={handleSearch} className="relative group">
          <input
            className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl px-8 py-6 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all text-white placeholder:text-zinc-600"
            placeholder="Pesquisar filme ou série no TMDB..."
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
                onClick={() => handleSelectMedia(item)}
                className={`group relative aspect-[2/3] rounded-2xl overflow-hidden border-2 transition-all text-left ${
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
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-[10px] truncate uppercase">{item.title || item.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Formulário de Configuração */}
        {selectedMedia && (
          <div className={`border p-8 md:p-12 rounded-[3rem] shadow-2xl animate-in slide-in-from-bottom-10 duration-700 relative overflow-hidden ${existingId ? 'bg-purple-900/10 border-purple-500/30' : 'bg-zinc-900/80 border-white/10'}`}>
            
            {/* Aviso de Edição */}
            {existingId && (
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded-bl-2xl tracking-widest flex items-center gap-2">
                <FaExclamationCircle /> Modo de Edição
              </div>
            )}

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
                      placeholder="https://mixdrop.co/e/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-purple-600 ml-2 tracking-widest flex items-center gap-2">
                      <FaServer /> Servidor 2 (UpStream)
                    </label>
                    <input
                      className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-purple-600 transition-all placeholder:text-zinc-800"
                      value={server2}
                      onChange={(e) => setServer2(e.target.value)}
                      placeholder="https://upstream.to/embed-..."
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-black py-5 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                  >
                    <FaSave /> {loading ? "A PROCESSAR..." : existingId ? "ATUALIZAR LINKS" : "PUBLICAR FILME"}
                  </button>
                  
                  {existingId && (
                    <button 
                      onClick={handleDelete}
                      className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-8 py-5 rounded-2xl font-black transition-all flex items-center gap-2"
                    >
                      <FaTrash /> ELIMINAR
                    </button>
                  )}

                  <button 
                    onClick={() => { setSelectedMedia(null); setExistingId(null); }}
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