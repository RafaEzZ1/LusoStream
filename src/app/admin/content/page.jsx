"use client";
import { useState } from "react";
import AdminClient from "../AdminClient";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { searchMulti } from "@/lib/tmdb"; // Certifica-te que esta função existe no teu lib/tmdb.js

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Links de Streaming
  const [streamUrl, setStreamUrl] = useState("");
  const [streamUrl2, setStreamUrl2] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 1. Pesquisar no TMDB
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const data = await searchMulti(searchQuery);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error(error);
      setMessage("Erro ao pesquisar no TMDB.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Selecionar um filme/série
  const handleSelect = (media) => {
    setSelectedMedia(media);
    setSearchResults([]);
    setSearchQuery("");
    setMessage("");
  };

  // 3. Guardar no Firebase
  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedMedia) return;

    setLoading(true);
    try {
      const mediaId = String(selectedMedia.id);
      
      // A) Guardar os Links (Para o Player funcionar)
      // Coleção: 'embeds' | Documento: ID do TMDB
      await setDoc(doc(db, "embeds", mediaId), {
        tmdbId: mediaId,
        type: selectedMedia.media_type,
        streamUrl: streamUrl || null,
        streamUrl2: streamUrl2 || null,
        updatedAt: serverTimestamp()
      });

      // B) Guardar Metadados (Para sabermos que filmes temos no sistema)
      // Coleção: 'catalog' | Documento: ID do TMDB
      await setDoc(doc(db, "catalog", mediaId), {
        tmdbId: mediaId,
        title: selectedMedia.title || selectedMedia.name,
        poster_path: selectedMedia.poster_path,
        backdrop_path: selectedMedia.backdrop_path,
        type: selectedMedia.media_type,
        addedAt: serverTimestamp()
      });

      setMessage("✅ Conteúdo adicionado com sucesso!");
      // Limpar formulário
      setSelectedMedia(null);
      setStreamUrl("");
      setStreamUrl2("");

    } catch (error) {
      console.error(error);
      setMessage("❌ Erro ao guardar na base de dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminClient>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Gestão de Conteúdo</h1>

        {/* --- BARRA DE PESQUISA --- */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Pesquisar filme ou série no TMDB..."
              className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition disabled:opacity-50"
            >
              {loading ? "..." : "Pesquisar"}
            </button>
          </form>

          {/* Resultados da Pesquisa */}
          {searchResults.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto custom-scrollbar">
              {searchResults.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => handleSelect(item)}
                  className="flex items-center gap-4 p-3 bg-black/40 hover:bg-white/10 rounded-lg cursor-pointer transition border border-white/5"
                >
                  {item.poster_path && (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} 
                      className="w-12 h-16 object-cover rounded" 
                      alt=""
                    />
                  )}
                  <div>
                    <p className="text-white font-bold">{item.title || item.name}</p>
                    <p className="text-gray-400 text-xs uppercase">{item.media_type} • {item.release_date || item.first_air_date || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- FORMULÁRIO DE EDIÇÃO --- */}
        {selectedMedia && (
          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 animate-fade-in">
            <div className="flex gap-6 mb-8">
              <img 
                src={`https://image.tmdb.org/t/p/w342${selectedMedia.poster_path}`} 
                className="w-32 rounded-lg shadow-lg"
                alt="" 
              />
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedMedia.title || selectedMedia.name}</h2>
                <p className="text-gray-400 mt-2 text-sm max-w-xl">{selectedMedia.overview}</p>
                <div className="mt-4 inline-block bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase border border-purple-500/30">
                  {selectedMedia.media_type}
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Link Mixdrop (Principal)</label>
                <input
                  type="text"
                  placeholder="https://mixdrop.co/e/..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Link Secundário (Opcional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-purple-500"
                  value={streamUrl2}
                  onChange={(e) => setStreamUrl2(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-green-900/20 disabled:opacity-50"
              >
                {loading ? "A Guardar..." : "💾 Publicar Filme"}
              </button>

              {message && (
                <div className={`p-4 rounded-lg text-center font-medium ${message.includes("sucesso") ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {message}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </AdminClient>
  );
}