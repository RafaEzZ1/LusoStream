"use client";
import { useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb"; 

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Dados do Formulário
  const [streamUrl, setStreamUrl] = useState("");
  const [season, setSeason] = useState("1"); // Para séries
  const [episode, setEpisode] = useState("1"); // Para séries
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await searchMulti(searchQuery);
      setSearchResults(data.results || []);
    } catch (error) {
      setMessage("Erro ao pesquisar.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (media) => {
    setSelectedMedia(media);
    setSearchResults([]);
    setSearchQuery("");
    setMessage("");
    // Resetar valores
    setSeason("1");
    setEpisode("1");
    setStreamUrl("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMedia) return;

    setLoading(true);
    try {
      const mediaId = String(selectedMedia.id);
      const isTv = selectedMedia.media_type === 'tv';
      
      // Construir ID único para o embed
      // Filmes: apenas o ID (ex: "550")
      // Séries: ID_S1_E1 (ex: "12345_S1_E1")
      const embedId = isTv ? `${mediaId}_S${season}_E${episode}` : mediaId;

      // 1. Guardar o Link (Embed)
      await setDoc(doc(db, "embeds", embedId), {
        tmdbId: mediaId,
        type: selectedMedia.media_type,
        streamUrl: streamUrl,
        season: isTv ? Number(season) : null,
        episode: isTv ? Number(episode) : null,
        updatedAt: serverTimestamp()
      });

      // 2. Guardar no Catálogo Geral (Para sabermos que existe no sistema)
      // Se for série, guardamos apenas o registo da série (não do episódio)
      await setDoc(doc(db, "catalog", mediaId), {
        tmdbId: mediaId,
        title: selectedMedia.title || selectedMedia.name,
        poster_path: selectedMedia.poster_path,
        type: selectedMedia.media_type,
        addedAt: serverTimestamp()
      });

      setMessage(isTv 
        ? `✅ Episódio S${season}E${episode} adicionado!` 
        : "✅ Filme adicionado!");
      
      // Se for série, não limpamos tudo para facilitar adicionar o próximo episódio
      if (!isTv) {
        setSelectedMedia(null);
      }
      setStreamUrl("");

    } catch (error) {
      console.error(error);
      setMessage("❌ Erro ao guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminClient>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 border-l-4 border-purple-500 pl-4">
          Adicionar Conteúdo
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA 1: PESQUISA */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h3 className="text-gray-400 text-sm font-bold uppercase mb-4">1. Encontrar no TMDB</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do filme/série..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" disabled={loading} className="bg-purple-600 p-2 rounded-lg text-white">
                  🔍
                </button>
              </form>

              {/* Lista de Resultados */}
              {searchResults.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {searchResults.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => handleSelect(item)}
                      className="flex items-center gap-3 p-2 hover:bg-white/10 rounded cursor-pointer transition"
                    >
                      {item.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-10 h-14 object-cover rounded" />
                      ) : <div className="w-10 h-14 bg-gray-800 rounded"></div>}
                      <div>
                        <p className="text-white text-sm font-bold line-clamp-1">{item.title || item.name}</p>
                        <span className="text-[10px] bg-white/10 px-1 rounded text-gray-400 uppercase">{item.media_type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* COLUNA 2: EDIÇÃO (Só aparece se selecionado) */}
          <div className="lg:col-span-2">
            {selectedMedia ? (
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10 animate-fade-in relative overflow-hidden">
                {/* Imagem de Fundo (Blur) */}
                {selectedMedia.backdrop_path && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                     <img src={`https://image.tmdb.org/t/p/w780${selectedMedia.backdrop_path}`} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="relative z-10 flex gap-6 mb-8">
                  <img src={`https://image.tmdb.org/t/p/w342${selectedMedia.poster_path}`} className="w-32 rounded-lg shadow-2xl" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMedia.title || selectedMedia.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedMedia.media_type === 'tv' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
                        {selectedMedia.media_type === 'tv' ? 'Série de TV' : 'Filme'}
                      </span>
                      <span className="text-gray-400 text-sm">{selectedMedia.release_date || selectedMedia.first_air_date}</span>
                    </div>
                    <p className="text-gray-400 mt-4 text-sm line-clamp-3">{selectedMedia.overview}</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="relative z-10 space-y-6 bg-black/40 p-6 rounded-xl border border-white/5">
                  
                  {/* SE FOR SÉRIE: MOSTRAR CAMPOS DE TEMPORADA/EPISÓDIO */}
                  {selectedMedia.media_type === 'tv' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-blue-400 text-xs font-bold uppercase mb-1">Temporada</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                          value={season}
                          onChange={(e) => setSeason(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-blue-400 text-xs font-bold uppercase mb-1">Episódio</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                          value={episode}
                          onChange={(e) => setEpisode(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-purple-400 text-xs font-bold uppercase mb-1">Link do Vídeo (Embed)</label>
                    <input
                      type="text"
                      placeholder="https://mixdrop.co/e/..."
                      className="w-full bg-black border border-white/10 rounded px-3 py-3 text-white focus:border-purple-500 outline-none"
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg transition shadow-lg disabled:opacity-50"
                  >
                    {loading ? "A processar..." : "Salvar Conteúdo"}
                  </button>

                  {message && (
                    <div className={`text-center text-sm font-medium ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                      {message}
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-white/5 rounded-2xl border border-white/10 border-dashed min-h-[400px]">
                <span className="text-4xl mb-4">🎬</span>
                <p>Seleciona um filme ou série à esquerda para começar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminClient>
  );
}