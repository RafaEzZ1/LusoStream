"use client";
import { useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb";
import toast from "react-hot-toast";

export default function ContentPage() {
  const [type, setType] = useState("movie"); // movie ou series
  const [tmdbId, setTmdbId] = useState("");
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [streamUrl, setStreamUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Sabe se estamos a editar

  // Pesquisa
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // --- FUNÇÃO INTELIGENTE: Verificar se já existe ---
  const checkExisting = async (idToCheck) => {
    try {
      const docRef = doc(db, "embeds", idToCheck);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStreamUrl(data.streamUrl); // Preenche o link automaticamente
        setIsEditing(true); // Ativa modo de edição
        toast("Conteúdo encontrado! Podes editar.", { icon: '✏️' });
      } else {
        setStreamUrl(""); // Limpa se for novo
        setIsEditing(false); // Modo criar
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Quando mudamos os inputs, verificamos se existe
  const handleIdChange = (e) => {
    const val = e.target.value;
    setTmdbId(val);
    if (type === 'movie' && val) checkExisting(val);
    if (type === 'series' && val) checkExisting(`${val}_S${season}_E${episode}`);
  };

  const handleSeasonChange = (e) => {
    const val = e.target.value;
    setSeason(val);
    if (type === 'series' && tmdbId) checkExisting(`${tmdbId}_S${val}_E${episode}`);
  };

  const handleEpisodeChange = (e) => {
    const val = e.target.value;
    setEpisode(val);
    if (type === 'series' && tmdbId) checkExisting(`${tmdbId}_S${season}_E${val}`);
  };

  // --- SALVAR (Adicionar ou Atualizar) ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!tmdbId || !streamUrl) return toast.error("Preenche tudo!");

    setLoading(true);
    try {
      // Gera o ID correto
      const docId = type === 'movie' ? tmdbId : `${tmdbId}_S${season}_E${episode}`;

      await setDoc(doc, "embeds", docId, {
        tmdbId,
        type,
        season: type === 'series' ? season : null,
        episode: type === 'series' ? episode : null,
        streamUrl,
        updatedAt: new Date()
      });

      toast.success(isEditing ? "Conteúdo Atualizado!" : "Conteúdo Adicionado!");
      
      // Não limpamos tudo para facilitar adicionar o próximo episódio
      if (type === 'series') {
        const nextEp = String(Number(episode) + 1);
        setEpisode(nextEp);
        setStreamUrl("");
        setIsEditing(false);
        checkExisting(`${tmdbId}_S${season}_E${nextEp}`); // Verifica se o próximo já existe
      } else {
        setTmdbId("");
        setStreamUrl("");
        setIsEditing(false);
      }

    } catch (error) {
      console.error(error);
      toast.error("Erro ao guardar.");
    } finally {
      setLoading(false);
    }
  };

  // --- APAGAR ---
  const handleDelete = async () => {
    if(!confirm("Tens a certeza que queres apagar este link?")) return;
    
    setLoading(true);
    try {
      const docId = type === 'movie' ? tmdbId : `${tmdbId}_S${season}_E${episode}`;
      await deleteDoc(doc(db, "embeds", docId));
      
      toast.success("Conteúdo Apagado!");
      setStreamUrl("");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao apagar.");
    } finally {
      setLoading(false);
    }
  };

  // --- Pesquisa TMDB (Auxiliar) ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    const data = await searchMulti(searchQuery);
    setSearchResults(data.results || []);
  };

  const selectItem = (item) => {
    setTmdbId(String(item.id));
    setSearchQuery("");
    setSearchResults([]);
    setType(item.media_type === 'tv' ? 'series' : 'movie');
    
    // Verifica logo se existe
    if (item.media_type === 'movie') {
      checkExisting(String(item.id));
    } else {
      checkExisting(`${item.id}_S${season}_E${episode}`);
    }
  };

  return (
    <AdminClient>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-4">
          Gestão de Conteúdo
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LADO ESQUERDO: Pesquisa TMDB */}
          <div className="space-y-4">
             <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
               <h3 className="font-bold text-white mb-2">1. Encontrar ID</h3>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white"
                   placeholder="Nome do filme/série..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 <button onClick={handleSearch} className="bg-blue-600 px-4 rounded text-white">🔍</button>
               </div>
               
               <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
                 {searchResults.map(item => (
                   <div key={item.id} onClick={() => selectItem(item)} className="flex items-center gap-2 p-2 hover:bg-zinc-800 cursor-pointer rounded">
                     {item.poster_path && <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-12 object-cover" />}
                     <div>
                       <p className="text-xs text-white font-bold">{item.title || item.name}</p>
                       <p className="text-[10px] text-gray-400">{item.media_type} • {item.id}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* LADO DIREITO: Editor */}
          <form onSubmit={handleSave} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="font-bold text-white mb-2 border-b border-zinc-700 pb-2">
              {isEditing ? "✏️ Editar Conteúdo Existente" : "➕ Adicionar Novo Conteúdo"}
            </h3>

            <div className="flex gap-4">
              <label className="text-white flex items-center gap-2">
                <input type="radio" checked={type === 'movie'} onChange={() => { setType('movie'); setTmdbId(""); setIsEditing(false); }} /> Filme
              </label>
              <label className="text-white flex items-center gap-2">
                <input type="radio" checked={type === 'series'} onChange={() => { setType('series'); setTmdbId(""); setIsEditing(false); }} /> Série
              </label>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">ID do TMDB</label>
              <input 
                type="text" 
                required 
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white"
                value={tmdbId}
                onChange={handleIdChange}
              />
            </div>

            {type === 'series' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Temporada</label>
                  <input type="number" className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white" value={season} onChange={handleSeasonChange} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Episódio</label>
                  <input type="number" className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white" value={episode} onChange={handleEpisodeChange} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Link do MixDrop / Stream</label>
              <input 
                type="text" 
                required 
                className="w-full bg-black border border-zinc-700 rounded px-3 py-2 text-white"
                placeholder="https://mixdrop.co/e/..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />
            </div>

            <div className="pt-4 flex gap-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 font-bold py-3 rounded hover:opacity-90 transition ${isEditing ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'}`}
              >
                {loading ? "A guardar..." : (isEditing ? "Atualizar Link" : "Adicionar Link")}
              </button>

              {isEditing && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
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