// src/app/admin/content/page.jsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState("movie"); // 'movie' ou 'tv'
  const [loading, setLoading] = useState(false);
  
  // Pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  // Campos de Inserção
  const [streamUrl, setStreamUrl] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");

  // 1. Pesquisar no TMDB
  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm) return;
    setLoading(true);
    
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/${activeTab}?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(searchTerm)}`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
      setSelectedItem(null); 
    } catch (error) {
      alert("Erro na pesquisa");
    }
    setLoading(false);
  }

  // 2. Selecionar
  function selectItem(item) {
    setSelectedItem(item);
    setSearchResults([]); 
    setSearchTerm("");    
  }

  // 3. Gravar na Base de Dados (COM OS TEUS NOMES DE TABELA)
  async function handleSave() {
    if (!selectedItem || !streamUrl) {
      alert("Falta selecionar o filme/série ou pôr o URL!");
      return;
    }
    setLoading(true);

    let error;

    if (activeTab === "movie") {
      // TABELA: movie_embeds (movie_id, url)
      const { error: err } = await supabase
        .from("movie_embeds") 
        .upsert({ 
            movie_id: selectedItem.id, 
            url: streamUrl 
        }, { onConflict: 'movie_id' }); // Garante que atualiza se já existir
      error = err;
    } else {
      // TABELA: episode_embeds (series_id, season, episode, url)
      if (!season || !episode) {
        alert("Falta Temporada e Episódio!");
        setLoading(false);
        return;
      }

      const { error: err } = await supabase
        .from("episode_embeds")
        .upsert({ 
            series_id: selectedItem.id, 
            season: parseInt(season), 
            episode: parseInt(episode), 
            url: streamUrl 
        }, { onConflict: 'series_id, season, episode' }); // Chave composta
      error = err;
    }

    setLoading(false);

    if (error) alert("Erro ao gravar: " + error.message);
    else {
      alert(`✅ Link adicionado para: ${selectedItem.title || selectedItem.name}`);
      setStreamUrl(""); 
      // Se for série, avança logo para o próximo episódio
      if (activeTab === "tv") {
         setEpisode(Number(episode) + 1); 
      }
    }
  }

  return (
    <div className="text-white max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-red-600">Gestor de Conteúdo (Embeds)</h1>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => { setActiveTab("movie"); setSearchResults([]); setSelectedItem(null); }} 
          className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === "movie" ? "bg-red-600" : "bg-gray-800 text-gray-400"}`}
        >
          🎬 Filmes
        </button>
        <button 
          onClick={() => { setActiveTab("tv"); setSearchResults([]); setSelectedItem(null); }} 
          className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === "tv" ? "bg-blue-600" : "bg-gray-800 text-gray-400"}`}
        >
          📺 Séries
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LADO ESQUERDO: PESQUISA */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h3 className="font-bold mb-4">1. Pesquisar {activeTab === "movie" ? "Filme" : "Série"}</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-white"
                placeholder={activeTab === "movie" ? "Ex: Deadpool" : "Ex: One Piece"}
              />
              <button className="bg-gray-700 px-4 rounded-lg hover:bg-white hover:text-black font-bold">🔎</button>
            </form>

            {/* Resultados */}
            {searchResults.length > 0 && (
               <div className="mt-4 max-h-80 overflow-y-auto space-y-2 border-t border-gray-800 pt-4 custom-scrollbar">
                 {searchResults.map((item) => (
                   <div 
                     key={item.id} 
                     onClick={() => selectItem(item)}
                     className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer transition"
                   >
                     <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "/no-image.jpg"} className="w-10 h-14 object-cover rounded" />
                     <div>
                       <div className="font-bold text-sm">{item.title || item.name}</div>
                       <div className="text-xs text-gray-500">{(item.release_date || item.first_air_date)?.split("-")[0]}</div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          {/* Preview Selecionado */}
          {selectedItem && (
            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl flex gap-4 items-center animate-in fade-in">
               <img src={`https://image.tmdb.org/t/p/w154${selectedItem.poster_path}`} className="w-20 rounded shadow-lg" />
               <div>
                 <div className="text-green-500 text-xs font-bold uppercase mb-1">Selecionado (ID: {selectedItem.id})</div>
                 <h3 className="font-bold text-xl">{selectedItem.title || selectedItem.name}</h3>
                 <button onClick={() => setSelectedItem(null)} className="text-xs text-red-400 hover:underline mt-2">Trocar</button>
               </div>
            </div>
          )}
        </div>

        {/* LADO DIREITO: INSERIR LINK */}
        <div className={`bg-gray-900 p-8 rounded-2xl border border-gray-800 h-fit transition-all ${!selectedItem ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <h3 className="font-bold mb-6">2. Dados do Embed</h3>
          
          <div className="space-y-6">
            
            {activeTab === "tv" && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-400 mb-2">Temporada</label>
                  <input type="number" value={season} onChange={(e) => setSeason(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="1" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-400 mb-2">Episódio</label>
                  <input type="number" value={episode} onChange={(e) => setEpisode(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500" placeholder="1" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">URL do Embed</label>
              <input 
                type="text" 
                value={streamUrl} 
                onChange={(e) => setStreamUrl(e.target.value)} 
                className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-green-500" 
                placeholder="https://..." 
              />
            </div>

            <button onClick={handleSave} disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold transition shadow-lg shadow-green-900/20">
              {loading ? "A gravar..." : "💾 Gravar Link"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}