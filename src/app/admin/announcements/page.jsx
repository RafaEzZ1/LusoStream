// src/app/admin/announcements/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // <--- ATUALIZADO

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function Announcements() {
  const supabase = createClient(); // <--- INSTÂNCIA
  const [list, setList] = useState([]);
  
  const [title, setTitle] = useState("");
  const [link, setLink] = useState(""); 
  const [selectedMedia, setSelectedMedia] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => { fetchAnnouncements(); }, []);

  async function fetchAnnouncements() {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if(data) setList(data);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if(!searchTerm) return;
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(searchTerm)}`);
    const data = await res.json();
    const valid = (data.results || []).filter(i => i.media_type === 'movie' || i.media_type === 'tv');
    setSearchResults(valid);
  }

  async function create() {
    if (!title) return alert("O título é obrigatório!");

    const imageUrl = selectedMedia ? `https://image.tmdb.org/t/p/original${selectedMedia.backdrop_path || selectedMedia.poster_path}` : null;

    const { error } = await supabase.from("announcements").insert([{ 
        title: title,
        link: link || null,
        image_url: imageUrl || null
    }]);
    
    if(!error) {
        setTitle(""); setLink(""); setSelectedMedia(null); setSearchTerm(""); setSearchResults([]);
        fetchAnnouncements();
        alert("Anúncio publicado! 📢");
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

      <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-4">
            <h3 className="font-bold">1. Dados do Aviso</h3>
            <input className="w-full bg-black border border-gray-700 rounded p-3" placeholder="Título (ex: Estreia Hoje!)" value={title} onChange={e=>setTitle(e.target.value)} />
            <input className="w-full bg-black border border-gray-700 rounded p-3" placeholder="Link / Mensagem (Opcional)" value={link} onChange={e=>setLink(e.target.value)} />
            
            <button onClick={create} className="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded font-bold">Publicar Anúncio</button>
        </div>

        <div className="bg-black/30 p-4 rounded-xl border border-gray-800">
             <h3 className="font-bold mb-2">2. Imagem de Fundo (Opcional)</h3>
             
             {!selectedMedia ? (
                 <>
                    <form onSubmit={handleSearch} className="flex gap-2 mb-2">
                        <input className="flex-1 bg-gray-900 border border-gray-700 rounded p-2 text-sm" placeholder="Pesquisar filme..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
                        <button className="bg-gray-700 px-3 rounded">🔎</button>
                    </form>
                    
                    <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                        {searchResults.map(item => (
                            <div key={item.id} onClick={() => {setSelectedMedia(item); setSearchResults([]);}} className="flex items-center gap-2 p-1 hover:bg-gray-800 cursor-pointer rounded">
                                <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} className="w-8 h-10 object-cover rounded" />
                                <span className="text-xs truncate flex-1">{item.title || item.name}</span>
                            </div>
                        ))}
                    </div>
                 </>
             ) : (
                 <div className="text-center relative">
                     <img src={`https://image.tmdb.org/t/p/w300${selectedMedia.backdrop_path || selectedMedia.poster_path}`} className="w-full h-32 object-cover rounded mb-2 shadow-lg" />
                     <p className="text-sm font-bold text-green-400 absolute bottom-1 left-2 bg-black/70 px-2 rounded">{selectedMedia.title || selectedMedia.name}</p>
                     <button onClick={() => setSelectedMedia(null)} className="text-xs text-red-500 underline mt-1 block mx-auto">Remover Imagem</button>
                 </div>
             )}
        </div>

      </div>

      <div className="space-y-3">
          {list.map(item => (
              <div key={item.id} className="bg-gray-900 p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      {item.image_url && <img src={item.image_url} className="w-16 h-10 object-cover rounded" />}
                      <div>
                          <h4 className="font-bold">{item.title}</h4>
                          <p className="text-sm text-gray-400">{item.link || "Sem link"}</p>
                      </div>
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-white bg-red-900/20 px-3 py-1 rounded text-sm">Apagar</button>
              </div>
          ))}
      </div>
    </div>
  );
}