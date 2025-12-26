"use client";
import { useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb";
import toast from "react-hot-toast";

export default function ContentPage() {
  const [type, setType] = useState("movie");
  const [tmdbId, setTmdbId] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [streamUrl, setStreamUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Verificar se já existe no Firebase
  const checkExisting = async (idToCheck) => {
    try {
      const docRef = doc(db, "embeds", idToCheck);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStreamUrl(data.streamUrl);
        setIsEditing(true);
        toast("Conteúdo encontrado! Podes editar.", { icon: '✏️' });
      } else {
        setStreamUrl("");
        setIsEditing(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleIdChange = (e) => {
    const val = e.target.value;
    setTmdbId(val);
    if (type === 'movie' && val) checkExisting(val);
    if (type === 'series' && val) checkExisting(`${val}_S${season}_E${episode}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!tmdbId || !streamUrl) return toast.error("Preenche tudo!");

    setLoading(true);
    try {
      const docId = type === 'movie' ? tmdbId : `${tmdbId}_S${season}_E${episode}`;
      
      // CORREÇÃO AQUI: Referência correta ao documento
      const docRef = doc(db, "embeds", docId);

      await setDoc(docRef, {
        tmdbId,
        type,
        season: type === 'series' ? season : null,
        episode: type === 'series' ? episode : null,
        streamUrl,
        updatedAt: new Date()
      }, { merge: true });

      toast.success(isEditing ? "Conteúdo Atualizado!" : "Conteúdo Adicionado!");
      
      if (type === 'series') {
        const nextEp = String(Number(episode) + 1);
        setEpisode(nextEp);
        setStreamUrl("");
        setIsEditing(false);
      } else {
        setTmdbId("");
        setStreamUrl("");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Erro ao guardar:", error);
      toast.error("Erro ao guardar na base de dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(!confirm("Tens a certeza que queres apagar este link?")) return;
    
    setLoading(true);
    try {
      const docId = type === 'movie' ? tmdbId : `${tmdbId}_S${season}_E${episode}`;
      await deleteDoc(doc(db, "embeds", docId));
      
      toast.success("Conteúdo Apagado!");
      setStreamUrl("");
      setIsEditing(false);
      setTmdbId("");
    } catch (error) {
      toast.error("Erro ao apagar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const data = await searchMulti(searchQuery);
    setSearchResults(data.results || []);
  };

  const selectItem = (item) => {
    const newId = String(item.id);
    const newType = item.media_type === 'tv' ? 'series' : 'movie';
    setTmdbId(newId);
    setType(newType);
    setSearchQuery("");
    setSearchResults([]);
    
    if (newType === 'movie') {
      checkExisting(newId);
    } else {
      checkExisting(`${newId}_S${season}_E${episode}`);
    }
  };

  return (
    <AdminClient>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-4">
          Gestão de Conteúdo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
               <h3 className="font-bold text-white mb-2">1. Encontrar ID</h3>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500"
                   placeholder="Nome do filme/série..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <button onClick={handleSearch} className="bg-blue-600 px-4 rounded text-white hover:bg-blue-700 transition">🔍</button>
               </div>
               
               <div className="mt-2 max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
                 {searchResults.map(item => (
                   <div key={item.id} onClick={() => selectItem(item)} className="flex items-center gap-2 p-2 hover:bg-zinc-800 cursor-pointer rounded transition">
                     {item.poster_path ? (
                       <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-12 object-cover rounded" />
                     ) : (
                       <div className="w-8 h-12 bg-zinc-700 rounded" />
                     )}
                     <div className="overflow-hidden">
                       <p className="text-xs text-white font-bold truncate">{item.title || item.name}</p>
                       <p className="text-[10px] text-gray-400 capitalize">{item.media_type === 'tv' ? 'Série' : 'Filme'} • {item.id}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          <form onSubmit={handleSave} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4 h-fit">
            <h3 className="font-bold text-white mb-2 border-b border-zinc-700 pb-2 flex justify-between">
              <span>{isEditing ? "✏️ Editar" : "➕ Adicionar"}</span>
              <span className="text-[10px] text-gray-500 uppercase self-center tracking-widest">{type}</span>
            </h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-bold uppercase tracking-tighter">ID do TMDB</label>
              <input 
                type="text" 
                required 
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500"
                value={tmdbId}
                onChange={handleIdChange}
              />
            </div>

            {type === 'series' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1 font-bold uppercase tracking-tighter">Temporada</label>
                  <input 
                    type="number" 
                    className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white outline-none" 
                    value={season} 
                    onChange={(e) => { setSeason(e.target.value); checkExisting(`${tmdbId}_S${e.target.value}_E${episode}`); }} 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1 font-bold uppercase tracking-tighter">Episódio</label>
                  <input 
                    type="number" 
                    className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white outline-none" 
                    value={episode} 
                    onChange={(e) => { setEpisode(e.target.value); checkExisting(`${tmdbId}_S${season}_E${e.target.value}`); }} 
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1 font-bold uppercase tracking-tighter">Link do Embed (MixDrop)</label>
              <input 
                type="text" 
                required 
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white outline-none focus:border-purple-500"
                placeholder="https://mixdrop.co/e/..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
            </div>

            <div className="pt-4 flex gap-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 font-bold py-3 rounded hover:brightness-110 transition active:scale-95 ${isEditing ? 'bg-orange-600' : 'bg-purple-600'} text-white`}
              >
                {loading ? "A processar..." : (isEditing ? "Atualizar Link" : "Adicionar Link")}
              </button>

              {isEditing && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 bg-red-600/20 text-red-500 border border-red-500/50 rounded hover:bg-red-600 hover:text-white transition active:scale-95"
                  title="Apagar Conteúdo"
                >
                  🗑️
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </AdminClient>
  );
}