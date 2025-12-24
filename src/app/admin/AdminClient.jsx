// src/app/admin/AdminClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client"; // <--- Novo Import
import { getUserAndRole, isModOrAdmin } from "@/lib/roles";
import { upsertMovieEmbed, deleteMovieEmbed, upsertEpisodeEmbed, deleteEpisodeEmbed, getMovieEmbed, getEpisodeEmbed } from "@/lib/embeds";
import AccessDenied from "@/components/AccessDenied";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AdminClient() {
  const router = useRouter();
  const supabase = createClient(); // Criar instância

  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  // Forms e Estados
  const [movieId, setMovieId] = useState("");
  const [movieUrl, setMovieUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [epUrl, setEpUrl] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifLink, setNotifLink] = useState("");
  const [notifImage, setNotifImage] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [search, setSearch] = useState("");
  const [movieHits, setMovieHits] = useState([]);
  const [seriesHits, setSeriesHits] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [notifMsg, setNotifMsg] = useState(null);
  const [currentMovieEmbed, setCurrentMovieEmbed] = useState(null);
  const [currentEpisodeEmbed, setCurrentEpisodeEmbed] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { user, role } = await getUserAndRole();
      if (!active) return;
      
      if (user && isModOrAdmin(role)) {
        setAuthorized(true);
      }
      setChecking(false);
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setMovieHits([]); setSeriesHits([]); return; }
      try {
        const [m, s] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(search)}`).then(r=>r.json()),
          fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(search)}`).then(r=>r.json()),
        ]);
        setMovieHits(m.results || []); setSeriesHits(s.results || []);
      } catch (e) {}
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function refreshMovieEmbed() { if (!movieId) { setCurrentMovieEmbed(null); return; } const url = await getMovieEmbed(movieId); setCurrentMovieEmbed(url); }
  async function refreshEpisodeEmbed() { if (!seriesId || !season || !episode) { setCurrentEpisodeEmbed(null); return; } const url = await getEpisodeEmbed(seriesId, season, episode); setCurrentEpisodeEmbed(url); }
  useEffect(() => { refreshMovieEmbed(); }, [movieId]);
  useEffect(() => { refreshEpisodeEmbed(); }, [seriesId, season, episode]);

  async function handleSendNotification() {
    if (!notifTitle.trim()) { setNotifMsg({ type: "error", text: "Escreve algo!" }); return; }
    setSendingNotif(true);
    const { error } = await supabase.from("announcements").insert({ title: notifTitle, link: notifLink || null, image_url: notifImage || null });
    setSendingNotif(false);
    if (error) setNotifMsg({ type: "error", text: error.message });
    else { setNotifMsg({ type: "ok", text: "Enviado! 🚀" }); setNotifTitle(""); setNotifLink(""); setNotifImage(""); }
  }

  if (checking) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Verificando...</div>;
  if (!authorized) return <AccessDenied />;

  return (
    <main className="pt-24 px-6 max-w-6xl mx-auto pb-16 text-white">
      <h1 className="text-3xl font-bold mb-8 text-red-600 border-l-4 border-white pl-4">Painel de Administração</h1>
      
      {/* Botões de Navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link href="/admin/suggestions" className="flex items-center gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition"><div className="bg-blue-500/20 p-3 rounded text-blue-400">💡</div><div><h3 className="font-bold">Pedidos</h3><p className="text-sm text-gray-400">Ver sugestões</p></div></Link>
        <Link href="/admin/reports" className="flex items-center gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition"><div className="bg-red-500/20 p-3 rounded text-red-500">🚩</div><div><h3 className="font-bold">Reports</h3><p className="text-sm text-gray-400">Ver erros</p></div></Link>
      </div>
      <hr className="border-gray-800 mb-10" />

      {/* Notificação Global */}
      <section className="mb-12 bg-gray-900/50 p-6 rounded-xl border border-yellow-900/30">
        <h2 className="text-xl font-bold mb-4 text-yellow-100">📢 Notificação Global</h2>
        {notifMsg && <div className={`mb-4 px-3 py-2 text-sm rounded ${notifMsg.type==="ok"?"bg-green-900/40 text-green-200":"bg-red-900/40 text-red-200"}`}>{notifMsg.text}</div>}
        <div className="flex flex-col gap-3">
           <div className="flex gap-3">
              <input value={notifTitle} onChange={(e)=>setNotifTitle(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded p-2" placeholder="Mensagem" />
              <input value={notifLink} onChange={(e)=>setNotifLink(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded p-2" placeholder="Link" />
           </div>
           <div className="flex items-center gap-3">
              <input value={notifImage} onChange={(e)=>setNotifImage(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded p-2 text-sm text-gray-400" placeholder="URL da Imagem (Automático)" />
              {notifImage && <img src={notifImage} className="w-8 h-12 object-cover rounded border border-gray-600" />}
           </div>
           <button onClick={handleSendNotification} disabled={sendingNotif} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded self-end">{sendingNotif ? "..." : "Enviar"}</button>
        </div>
      </section>

      {/* Gestor de Embeds */}
      <hr className="border-gray-800 mb-10" />
      <h2 className="text-2xl font-bold mb-6">Gestor de Embeds</h2>
      {statusMsg && <div className={`mb-4 px-3 py-2 text-sm rounded ${statusMsg.type==="ok"?"bg-green-900/40 text-green-200":"bg-red-900/40 text-red-200"}`}>{statusMsg.text}</div>}

      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} className="bg-black border border-gray-700 rounded p-2 w-full" placeholder="Pesquisar..." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
           {/* Filmes */}
           <div className="space-y-2 max-h-80 overflow-auto pr-2">
              {movieHits.map(m => (
                 <button key={m.id} onClick={()=>{setMovieId(String(m.id)); setNotifTitle(`${m.title} disponível!`); setNotifLink(`/watch/movie/${m.id}`); setNotifImage(m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "");}} className="w-full text-left bg-gray-900 hover:bg-gray-800 p-2 rounded flex gap-3"><img src={m.poster_path?`https://image.tmdb.org/t/p/w92${m.poster_path}`:"/no-image.jpg"} className="w-10 h-14 object-cover rounded"/><div><div className="font-bold text-sm">{m.title}</div><div className="text-xs text-gray-500">{m.id}</div></div></button>
              ))}
           </div>
           {/* Séries */}
           <div className="space-y-2 max-h-80 overflow-auto pr-2">
              {seriesHits.map(s => (
                 <button key={s.id} onClick={()=>{setSeriesId(String(s.id)); setNotifTitle(`${s.name} - Novos episódios!`); setNotifLink(`/series/${s.id}`); setNotifImage(s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "");}} className="w-full text-left bg-gray-900 hover:bg-gray-800 p-2 rounded flex gap-3"><img src={s.poster_path?`https://image.tmdb.org/t/p/w92${s.poster_path}`:"/no-image.jpg"} className="w-10 h-14 object-cover rounded"/><div><div className="font-bold text-sm">{s.name}</div><div className="text-xs text-gray-500">{s.id}</div></div></button>
              ))}
           </div>
        </div>
      </section>

      {/* Forms Simplificados */}
      <section className="mb-8 p-6 bg-gray-900/30 rounded border border-gray-800">
         <h3 className="font-bold mb-3">Filme</h3>
         <div className="flex gap-2 mb-2"><input value={movieId} onChange={e=>setMovieId(e.target.value)} placeholder="ID" className="bg-black border border-gray-700 p-2 rounded w-1/3"/><input value={movieUrl} onChange={e=>setMovieUrl(e.target.value)} placeholder="URL" className="bg-black border border-gray-700 p-2 rounded w-2/3"/></div>
         <button onClick={async()=>{const{error}=await upsertMovieEmbed(movieId,movieUrl);setStatusMsg(error?{type:'error',text:error.message}:{type:'ok',text:'Guardado!'});refreshMovieEmbed()}} className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-700">Guardar</button>
      </section>
      
      <section className="p-6 bg-gray-900/30 rounded border border-gray-800">
         <h3 className="font-bold mb-3">Episódio</h3>
         <div className="flex gap-2 mb-2"><input value={seriesId} onChange={e=>setSeriesId(e.target.value)} placeholder="ID" className="bg-black border border-gray-700 p-2 rounded w-1/4"/><input value={season} onChange={e=>setSeason(e.target.value)} placeholder="T" className="bg-black border border-gray-700 p-2 rounded w-16"/><input value={episode} onChange={e=>setEpisode(e.target.value)} placeholder="E" className="bg-black border border-gray-700 p-2 rounded w-16"/><input value={epUrl} onChange={e=>setEpUrl(e.target.value)} placeholder="URL" className="bg-black border border-gray-700 p-2 rounded flex-1"/></div>
         <button onClick={async()=>{const{error}=await upsertEpisodeEmbed(seriesId,season,episode,epUrl);setStatusMsg(error?{type:'error',text:error.message}:{type:'ok',text:'Guardado!'});refreshEpisodeEmbed()}} className="bg-red-600 px-4 py-2 rounded font-bold hover:bg-red-700">Guardar</button>
      </section>
    </main>
  );
}