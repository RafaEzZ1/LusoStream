"use client";
import { useState, useEffect } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb";
import toast from "react-hot-toast";
import { FaSearch, FaServer, FaFilm, FaTv, FaTrash, FaSave, FaExclamationCircle, FaHashtag, FaMicrophoneAlt } from "react-icons/fa";

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Estados do Formulário
  const [server1, setServer1] = useState("");
  const [server2, setServer2] = useState("");
  const [existingId, setExistingId] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- NOVO: Estados de Dobragem ---
  const [isDubbed, setIsDubbed] = useState(false);
  const [dubbedInfo, setDubbedInfo] = useState(""); 

  // NOVOS ESTADOS PARA SÉRIES
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [existingEpisodesData, setExistingEpisodesData] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const data = await searchMulti(searchQuery);
      setResults(data.results || []);
      setSelectedMedia(null);
    } catch (error) { toast.error("Erro na pesquisa."); }
  };

  useEffect(() => {
    if (selectedMedia?.media_type === "tv" && existingEpisodesData) {
      const key = `S${season}_E${episode}`;
      const episodeData = existingEpisodesData[key];
      if (episodeData) {
        setServer1(episodeData.server1 || "");
        setServer2(episodeData.server2 || "");
      } else {
        setServer1(""); setServer2("");
      }
    }
  }, [season, episode, existingEpisodesData, selectedMedia]);

  const handleSelectMedia = async (item) => {
    setLoading(true); setSelectedMedia(item);
    setServer1(""); setServer2(""); setExistingId(null);
    setSeason(1); setEpisode(1); setExistingEpisodesData({});
    // Reset Dobragem
    setIsDubbed(false); setDubbedInfo("");

    try {
      const q = query(collection(db, "content"), where("tmdbId", "==", item.id.toString()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        const data = docData.data();
        setExistingId(docData.id);
        
        // Carregar Dobragem
        setIsDubbed(data.isDubbed || false);
        setDubbedInfo(data.dubbedInfo || "");

        if (item.media_type === "movie") {
          setServer1(data.server1 || data.embedUrl || "");
          setServer2(data.server2 || "");
          toast("Filme encontrado. Modo de Edição.", { icon: "✏️" });
        } else {
          setExistingEpisodesData(data.episodes || {});
          if (data.episodes && data.episodes["S1_E1"]) {
             setServer1(data.episodes["S1_E1"].server1 || "");
             setServer2(data.episodes["S1_E1"].server2 || "");
          }
          toast("Série encontrada. Gere os episódios abaixo.", { icon: "📺" });
        }
      }
    } catch (error) { console.error(error); toast.error("Erro ao carregar dados."); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!selectedMedia) return;
    if (!server1) return toast.error("Preenche pelo menos o Servidor 1!");
    setLoading(true);

    const isSeries = selectedMedia.media_type === "tv" || selectedMedia.media_type === "series";
    const baseData = {
      tmdbId: selectedMedia.id.toString(),
      title: selectedMedia.title || selectedMedia.name,
      type: selectedMedia.media_type,
      poster_path: selectedMedia.poster_path,
      backdrop_path: selectedMedia.backdrop_path,
      // --- Guardar Dobragem ---
      isDubbed: isDubbed,
      dubbedInfo: dubbedInfo,
      updatedAt: serverTimestamp(),
    };

    try {
      const collectionRef = collection(db, "content");
      let docRef;
      if (existingId) docRef = doc(db, "content", existingId);
      else {
        const newDocRef = await addDoc(collectionRef, { ...baseData, createdAt: serverTimestamp(), episodes: {} });
        docRef = newDocRef; setExistingId(newDocRef.id);
      }

      if (isSeries) {
        const episodeKey = `S${season}_E${episode}`;
        await updateDoc(docRef, {
          ...baseData,
          [`episodes.${episodeKey}`]: { server1: server1, server2: server2 || "", updatedAt: new Date().toISOString() }
        });
        setExistingEpisodesData(prev => ({ ...prev, [episodeKey]: { server1, server2 } }));
        toast.success(`Episódio S${season}:E${episode} guardado!`);
      } else {
        await updateDoc(docRef, { ...baseData, server1: server1, server2: server2 || "", embedUrl: server1 });
        toast.success("Filme atualizado com sucesso!");
      }
    } catch (error) { console.error(error); toast.error("Erro ao guardar na base de dados."); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!existingId) return;
    if (!confirm(`ATENÇÃO: Isto vai apagar tudo. Continuar?`)) return;
    setLoading(true);
    try { await deleteDoc(doc(db, "content", existingId)); toast.success("Conteúdo eliminado."); setSelectedMedia(null); setServer1(""); setServer2(""); setExistingId(null); } catch (error) { toast.error("Erro ao eliminar."); } finally { setLoading(false); }
  };

  return (
    <AdminClient>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black italic tracking-tighter text-white">GESTOR DE <span className="text-purple-600">CONTEÚDO</span></h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest">Adiciona, edita ou remove filmes e séries.</p>
        </div>
        <form onSubmit={handleSearch} className="relative group">
          <input className="w-full bg-zinc-900/50 border border-white/5 rounded-3xl px-8 py-6 outline-none focus:border-purple-600 transition-all text-white placeholder:text-zinc-600" placeholder="Pesquisar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 p-4 rounded-2xl text-white transition-all"><FaSearch size={18} /></button>
        </form>

        {results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 animate-in fade-in duration-500">
            {results.map((item) => (
              <button key={item.id} onClick={() => handleSelectMedia(item)} className="group relative aspect-[2/3] rounded-2xl overflow-hidden border-2 transition-all text-left border-white/5 hover:border-purple-600/50">
                {item.poster_path ? <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 text-[10px]">Sem Capa</div>}
              </button>
            ))}
          </div>
        )}

        {selectedMedia && (
          <div className={`border p-8 md:p-12 rounded-[3rem] relative ${existingId ? 'bg-purple-900/10 border-purple-500/30' : 'bg-zinc-900/80 border-white/10'}`}>
            {existingId && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded-bl-2xl tracking-widest flex items-center gap-2"><FaExclamationCircle /> Modo de Edição</div>}
            <div className="flex flex-col md:flex-row gap-8">
              <img src={`https://image.tmdb.org/t/p/w342${selectedMedia.poster_path}`} className="w-32 rounded-xl shadow-lg" />
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-black text-white">{selectedMedia.title || selectedMedia.name}</h2>
                
                {/* --- ZONA DE DOBRAGEM --- */}
                <div className="flex flex-wrap items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div onClick={() => setIsDubbed(!isDubbed)} className={`cursor-pointer px-4 py-3 rounded-xl border flex items-center gap-3 select-none ${isDubbed ? "bg-green-600 border-green-500 text-white" : "bg-zinc-900 border-white/10 text-zinc-500 hover:bg-zinc-800"}`}>
                      <FaMicrophoneAlt />
                      <span className="font-bold text-xs uppercase tracking-widest">{isDubbed ? "Com Dobragem PT-PT" : "Sem Dobragem"}</span>
                    </div>
                    {isDubbed && (<input placeholder="Ex: T1-T3" value={dubbedInfo} onChange={(e) => setDubbedInfo(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 w-32 placeholder:text-zinc-600 font-bold" />)}
                </div>

                {selectedMedia.media_type === 'tv' && (
                  <div className="bg-black/40 p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><FaHashtag /> Selecionar Episódio</h3>
                    <div className="flex gap-4">
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 uppercase font-bold">Temporada</label><input type="number" min="1" value={season} onChange={(e) => setSeason(parseInt(e.target.value) || 1)} className="w-24 bg-zinc-900 border border-white/10 p-3 rounded-xl text-center font-bold text-white focus:border-purple-600 outline-none"/></div>
                        <div className="space-y-1"><label className="text-[10px] text-zinc-500 uppercase font-bold">Episódio</label><input type="number" min="1" value={episode} onChange={(e) => setEpisode(parseInt(e.target.value) || 1)} className="w-24 bg-zinc-900 border border-white/10 p-3 rounded-xl text-center font-bold text-white focus:border-purple-600 outline-none"/></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest flex items-center gap-2"><FaServer className="text-purple-600" /> Servidor 1</label><input className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-purple-600" value={server1} onChange={(e) => setServer1(e.target.value)} placeholder="Link Principal..." /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase text-purple-600 ml-2 tracking-widest flex items-center gap-2"><FaServer /> Servidor 2</label><input className="w-full bg-black border border-white/5 rounded-2xl p-5 text-white outline-none focus:border-purple-600" value={server2} onChange={(e) => setServer2(e.target.value)} placeholder="Link de reserva..." /></div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={handleSave} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-5 rounded-2xl shadow-lg"><FaSave /> {loading ? "A GUARDAR..." : "GUARDAR"}</button>
                  {existingId && (<button onClick={handleDelete} className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white px-8 py-5 rounded-2xl font-black flex items-center gap-2"><FaTrash /> ELIMINAR</button>)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminClient>
  );
}