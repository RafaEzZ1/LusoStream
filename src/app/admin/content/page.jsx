// src/app/admin/content/page.jsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState("movie"); // 'movie' ou 'tv'
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  // Campos
  const [tmdbId, setTmdbId] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");

  // Verifica imagem automática no TMDB
  async function checkTMDB() {
    if (!tmdbId) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/${activeTab}/${tmdbId}?api_key=${API_KEY}&language=pt-BR`);
      const data = await res.json();
      if (data.id) setPreview(data);
      else { alert("ID não encontrado!"); setPreview(null); }
    } catch (e) { alert("Erro ao buscar TMDB"); }
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);

    let error;

    // LÓGICA CORRIGIDA COM OS NOMES DAS TUAS TABELAS
    if (activeTab === "movie") {
      // Tabela: movie_embeds
      const { error: err } = await supabase
        .from("movie_embeds") 
        .upsert({ 
            tmdb_id: tmdbId, 
            stream_url: streamUrl 
        }); // Assume que as colunas lá dentro são tmdb_id e stream_url
      error = err;
    } else {
      // Tabela: episode_embeds
      const { error: err } = await supabase
        .from("episode_embeds")
        .upsert({ 
            tmdb_id: tmdbId, 
            season_number: season, 
            episode_number: episode, 
            stream_url: streamUrl 
        }, { onConflict: 'tmdb_id, season_number, episode_number' });
      error = err;
    }

    setLoading(false);

    if (error) alert("Erro ao gravar (Verifica os nomes das colunas): " + error.message);
    else {
      alert("✅ Link Adicionado!");
      setStreamUrl(""); 
    }
  }

  return (
    <div className="text-white max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-red-600">Gestor de Conteúdo (Embeds)</h1>

      <div className="flex gap-4 mb-8">
        <button onClick={() => { setActiveTab("movie"); setPreview(null); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === "movie" ? "bg-red-600" : "bg-gray-800 text-gray-400"}`}>🎬 Filmes</button>
        <button onClick={() => { setActiveTab("tv"); setPreview(null); }} className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === "tv" ? "bg-blue-600" : "bg-gray-800 text-gray-400"}`}>📺 Séries</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 h-fit">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">ID do TMDB</label>
              <div className="flex gap-2">
                <input type="number" value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-white" placeholder="Ex: 550" required />
                <button type="button" onClick={checkTMDB} className="bg-gray-700 px-4 rounded-lg hover:bg-gray-600">🔍</button>
              </div>
            </div>

            {activeTab === "tv" && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-400 mb-2">Temporada</label>
                  <input type="number" value={season} onChange={(e) => setSeason(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-400 mb-2">Episódio</label>
                  <input type="number" value={episode} onChange={(e) => setEpisode(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none" required />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-400 mb-2">Link do Embed</label>
              <input type="text" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} className="w-full bg-black border border-gray-700 rounded-lg p-3 outline-none focus:border-green-500" placeholder="https://..." required />
            </div>

            <button disabled={loading} className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold transition">
              {loading ? "A gravar..." : "💾 Gravar Embed"}
            </button>
          </form>
        </div>

        <div className="bg-black border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {preview ? (
            <div className="relative z-10">
              <img src={`https://image.tmdb.org/t/p/w500${preview.poster_path}`} alt="Poster" className="w-48 mx-auto rounded-lg shadow-2xl mb-4" />
              <h3 className="text-xl font-bold text-white">{preview.title || preview.name}</h3>
              {activeTab === "tv" && season && episode && (
                <div className="mt-4 bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-sm font-bold border border-blue-600/30">
                  T{season} : E{episode}
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-700">
              <span className="text-6xl block mb-4 opacity-30">🎬</span>
              <p>Insere o ID para ver a imagem.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}