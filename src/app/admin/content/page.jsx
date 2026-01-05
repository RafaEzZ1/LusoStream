"use client";
import { useState, useEffect } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb";
import toast from "react-hot-toast";
import { FaSearch, FaExclamationCircle, FaMicrophoneAlt, FaServer, FaTrash, FaSave } from "react-icons/fa";

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Estados do Formulário
  const [server1, setServer1] = useState("");
  const [server2, setServer2] = useState("");
  const [existingId, setExistingId] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- DOBRAGEM (ESSENCIAL) ---
  const [isDubbed, setIsDubbed] = useState(false);
  const [dubbedInfo, setDubbedInfo] = useState(""); // Ex: "T1-T3"

  // Estados para Séries
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
        setServer1("");
        setServer2("");
      }
    }
  }, [season, episode, existingEpisodesData, selectedMedia]);

  const handleSelectMedia = async (item) => {
    setLoading(true);
    setSelectedMedia(item);
    
    setServer1(""); setServer2(""); setExistingId(null);
    setSeason(1); setEpisode(1); setExistingEpisodesData({});
    setIsDubbed(false); setDubbedInfo("");

    try {
      const q = query(collection(db, "content"), where("tmdbId", "==", item.id.toString()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docData = querySnapshot.docs[0];
        const data = docData.data();
        setExistingId(docData.id);
        
        setIsDubbed(data.isDubbed || false);
        setDubbedInfo(data.dubbedInfo || "");

        if (item.media_type === "movie") {
          setServer1(data.server1 || data.embedUrl || "");
          setServer2(data.server2 || "");
          toast("Filme encontrado.", { icon: "✏️" });
        } else {
          setExistingEpisodesData(data.episodes || {});
          if (data.episodes?.["S1_E1"]) {
             setServer1(data.episodes["S1_E1"].server1 || "");
             setServer2(data.episodes["S1_E1"].server2 || "");
          }
          toast("Série encontrada.", { icon: "📺" });
        }
      }
    } catch (error) { toast.error("Erro ao carregar."); } 
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!selectedMedia) return;
    if (!server1) return toast.error("Falta o Servidor 1!");
    setLoading(true);

    const isSeries = selectedMedia.media_type === "tv" || selectedMedia.media_type === "series";
    const baseData = {
      tmdbId: selectedMedia.id.toString(),
      title: selectedMedia.title || selectedMedia.name,
      type: selectedMedia.media_type,
      poster_path: selectedMedia.poster_path,
      backdrop_path: selectedMedia.backdrop_path,
      isDubbed: isDubbed,       // GUARDA
      dubbedInfo: dubbedInfo,   // GUARDA
      updatedAt: serverTimestamp(),
    };

    try {
      const collectionRef = collection(db, "content");
      let docRef;
      if (existingId) docRef = doc(db, "content", existingId);
      else {
        docRef = await addDoc(collectionRef, { ...baseData, createdAt: serverTimestamp(), episodes: {} });
        setExistingId(docRef.id);
      }

      if (isSeries) {
        const episodeKey = `S${season}_E${episode}`;
        await updateDoc(docRef, {
          ...baseData, 
          [`episodes.${episodeKey}`]: { server1, server2: server2 || "", updatedAt: new Date().toISOString() }
        });
        setExistingEpisodesData(prev => ({ ...prev, [episodeKey]: { server1, server2 } }));
        toast.success(`S${season}:E${episode} guardado!`);
      } else {
        await updateDoc(docRef, { ...baseData, server1, server2: server2 || "", embedUrl: server1 });
        toast.success("Filme guardado!");
      }
    } catch (error) { toast.error("Erro ao guardar."); } 
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!existingId || !confirm("Apagar tudo?")) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "content", existingId));
      toast.success("Eliminado.");
      setSelectedMedia(null);
    } catch (error) { toast.error("Erro."); } 
    finally { setLoading(false); }
  };

  return (
    <AdminClient>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        <h1 className="text-4xl font-black italic tracking-tighter text-white">ADMIN <span className="text-purple-600">CONTENT</span></h1>
        
        <form onSubmit={handleSearch} className="relative group">
          <input className="w-full bg-zinc-900 border border-white/5 rounded-3xl px-8 py-6 text-white outline-none focus:border-purple-600" placeholder="Pesquisar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-600 p-4 rounded-2xl text-white"><FaSearch /></button>
        </form>

        {results.length > 0 && (
          <div className="grid grid-cols-5 gap-4">
            {results.map((item) => (
              <button key={item.id} onClick={() => handleSelectMedia(item)} className="aspect-[2/3] rounded-xl overflow-hidden border border-white/10 hover:border-purple-600">
                {item.poster_path && <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} className="w-full h-full object-cover" />}
              </button>
            ))}
          </div>
        )}

        {selectedMedia && (
          <div className="bg-zinc-900/80 border border-white/10 p-8 rounded-[3rem] relative">
            {existingId && <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-6 py-2 rounded-bl-2xl uppercase"><FaExclamationCircle className="inline mr-2"/>Edição</div>}
            
            <div className="flex gap-8">
              <img src={`https://image.tmdb.org/t/p/w342${selectedMedia.poster_path}`} className="w-32 rounded-xl h-fit" />
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl font-bold text-white">{selectedMedia.title || selectedMedia.name}</h2>
                
                {/* --- INPUTS DOBRAGEM --- */}
                <div className="flex flex-wrap items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div onClick={() => setIsDubbed(!isDubbed)} className={`cursor-pointer px-4 py-3 rounded-xl border flex items-center gap-3 select-none ${isDubbed ? "bg-green-600 border-green-500 text-white" : "bg-zinc-800 border-white/10 text-zinc-500"}`}>
                      <FaMicrophoneAlt />
                      <span className="font-bold text-xs uppercase">{isDubbed ? "Com Dobragem" : "Sem Dobragem"}</span>
                    </div>
                    {isDubbed && (
                        <input placeholder="Ex: T1-T3 ou Filme" value={dubbedInfo} onChange={(e) => setDubbedInfo(e.target.value)} className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 w-48 font-bold" />
                    )}
                </div>

                {selectedMedia.media_type === 'tv' && (
                  <div className="flex gap-4">
                    <input type="number" min="1" value={season} onChange={(e) => setSeason(parseInt(e.target.value)||1)} className="w-20 bg-zinc-900 border border-white/10 p-3 rounded-xl text-center text-white font-bold"/>
                    <input type="number" min="1" value={episode} onChange={(e) => setEpisode(parseInt(e.target.value)||1)} className="w-20 bg-zinc-900 border border-white/10 p-3 rounded-xl text-center text-white font-bold"/>
                  </div>
                )}

                <div className="grid gap-4">
                    <input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-purple-600" value={server1} onChange={(e)=>setServer1(e.target.value)} placeholder="Link Principal..." />
                    <input className="w-full bg-black border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-purple-600" value={server2} onChange={(e)=>setServer2(e.target.value)} placeholder="Link Reserva..." />
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSave} disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-500 py-4 rounded-xl text-white font-black">{loading ? "..." : "GUARDAR"}</button>
                  {existingId && <button onClick={handleDelete} className="px-6 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><FaTrash /></button>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminClient>
  );
}