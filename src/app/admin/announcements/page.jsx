// src/app/admin/announcements/page.jsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function Announcements() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [previewImg, setPreviewImg] = useState("");

  useEffect(() => { fetchAnnouncements(); }, []);

  async function fetchAnnouncements() {
    // Busca os anúncios
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if(data) setList(data);
  }

  // Lógica Automática de Imagem
  async function checkImage() {
    if(!tmdbId) return setPreviewImg("");
    // Tenta Filme
    let res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${API_KEY}`);
    if(!res.ok) {
       // Se falhar, tenta Série
       res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${API_KEY}`);
    }
    const data = await res.json();
    
    // Se encontrar imagem, mostra preview
    if(data.poster_path) {
        setPreviewImg(`https://image.tmdb.org/t/p/w200${data.poster_path}`);
    } else {
        setPreviewImg("");
    }
  }

  async function create(e) {
    e.preventDefault();
    // Tabela: announcements
    const { error } = await supabase.from("announcements").insert([{ 
        title, 
        message, 
        tmdb_id: tmdbId || null, 
        active: true 
    }]);
    
    if(!error) {
        setTitle(""); setMessage(""); setTmdbId(""); setPreviewImg("");
        fetchAnnouncements();
        alert("Anúncio criado!");
    } else {
        alert("Erro: " + error.message);
    }
  }

  async function deleteItem(id) {
      if(!confirm("Apagar anúncio?")) return;
      await supabase.from("announcements").delete().eq("id", id);
      fetchAnnouncements();
  }

  return (
    <div className="text-white max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-yellow-500">Gerir Anúncios</h1>

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-10">
        <h3 className="font-bold mb-4">Novo Aviso Global</h3>
        
        <form onSubmit={create} className="flex flex-col gap-4">
            <input className="bg-black border border-gray-700 rounded p-3" placeholder="Título (ex: Estreia Hoje!)" value={title} onChange={e=>setTitle(e.target.value)} required />
            <input className="bg-black border border-gray-700 rounded p-3" placeholder="Mensagem..." value={message} onChange={e=>setMessage(e.target.value)} required />
            
            <div className="flex gap-4 items-center">
                <input 
                    className="bg-black border border-gray-700 rounded p-3 w-40" 
                    placeholder="ID TMDB (Img Auto)" 
                    value={tmdbId} 
                    onChange={e=>setTmdbId(e.target.value)} 
                    onBlur={checkImage} // Busca imagem ao sair do campo
                />
                {previewImg && <img src={previewImg} className="h-16 w-12 object-cover rounded border border-gray-500" />}
                <span className="text-xs text-gray-500">O ID escolhe a imagem automaticamente.</span>
            </div>

            <button className="bg-yellow-600 hover:bg-yellow-700 p-3 rounded font-bold mt-2">Publicar</button>
        </form>
      </div>

      <div className="space-y-3">
          {list.map(item => (
              <div key={item.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-sm text-gray-400">{item.message}</p>
                      {item.tmdb_id && <span className="text-xs text-blue-400">ID Imagem: {item.tmdb_id}</span>}
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="text-red-500 bg-red-900/20 px-3 py-1 rounded text-sm hover:bg-red-900/40">Apagar</button>
              </div>
          ))}
      </div>
    </div>
  );
}