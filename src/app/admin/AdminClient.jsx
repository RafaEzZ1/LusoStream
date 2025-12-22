// src/app/admin/AdminClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getUserAndRole, isModOrAdmin } from "@/lib/roles";
import {
  upsertMovieEmbed,
  deleteMovieEmbed,
  upsertEpisodeEmbed,
  deleteEpisodeEmbed,
  getMovieEmbed,
  getEpisodeEmbed,
} from "@/lib/embeds";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AdminClient() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false); // Bloqueia tudo por defeito

  // Forms Embeds
  const [movieId, setMovieId] = useState("");
  const [movieUrl, setMovieUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [epUrl, setEpUrl] = useState("");

  // Form Notificação
  const [notifTitle, setNotifTitle] = useState("");
  const [notifLink, setNotifLink] = useState("");
  const [notifImage, setNotifImage] = useState(""); // URL da imagem
  const [sendingNotif, setSendingNotif] = useState(false);

  // Ajuda TMDB
  const [search, setSearch] = useState("");
  const [movieHits, setMovieHits] = useState([]);
  const [seriesHits, setSeriesHits] = useState([]);
  
  // Seleção visual
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);

  // Feedback
  const [statusMsg, setStatusMsg] = useState(null);
  const [notifMsg, setNotifMsg] = useState(null);
  const [currentMovieEmbed, setCurrentMovieEmbed] = useState(null);
  const [currentEpisodeEmbed, setCurrentEpisodeEmbed] = useState(null);

  // 🔒 SEGURANÇA MÁXIMA
  useEffect(() => {
    let active = true;
    (async () => {
      const { user, role } = await getUserAndRole();
      if (!active) return;

      // Se não for admin/mod, expulsa imediatamente
      if (!user || !isModOrAdmin(role)) {
        router.replace("/"); // Manda para a home
        return;
      }
      
      // Se chegou aqui, é Admin
      setAuthorized(true);
    })();
    return () => { active = false; };
  }, [router]);

  // Busca TMDB
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setMovieHits([]); setSeriesHits([]); return; }
      try {
        const [m, s] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(search)}`).then((r) => r.json()),
          fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(search)}`).then((r) => r.json()),
        ]);
        setMovieHits(m.results || []);
        setSeriesHits(s.results || []);
      } catch (e) { console.error(e); }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function refreshMovieEmbed() {
    if (!movieId) { setCurrentMovieEmbed(null); return; }
    const url = await getMovieEmbed(movieId); setCurrentMovieEmbed(url);
  }
  async function refreshEpisodeEmbed() {
    if (!seriesId || !season || !episode) { setCurrentEpisodeEmbed(null); return; }
    const url = await getEpisodeEmbed(seriesId, season, episode); setCurrentEpisodeEmbed(url);
  }
  useEffect(() => { refreshMovieEmbed(); }, [movieId]);
  useEffect(() => { refreshEpisodeEmbed(); }, [seriesId, season, episode]);

  // Função para enviar notificação com imagem
  async function handleSendNotification() {
    if (!notifTitle.trim()) {
      setNotifMsg({ type: "error", text: "Escreve uma mensagem!" });
      return;
    }
    setSendingNotif(true);
    const { error } = await supabase.from("announcements").insert({
      title: notifTitle,
      link: notifLink || null,
      image_url: notifImage || null // Envia a imagem
    });
    setSendingNotif(false);

    if (error) {
      setNotifMsg({ type: "error", text: error.message });
    } else {
      setNotifMsg({ type: "ok", text: "Notificação com foto enviada! 🚀" });
      setNotifTitle("");
      setNotifLink("");
      setNotifImage("");
    }
  }

  // Se não estiver autorizado, não mostra NADA (tela preta ou loading)
  if (!authorized) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">A verificar permissões...</div>;

  return (
    <main className="pt-24 px-6 max-w-6xl mx-auto pb-16 text-white">
      
      <h1 className="text-3xl font-bold mb-8 text-red-600 border-l-4 border-white pl-4">
        Painel de Administração
      </h1>

      {/* --- BOTÕES DE GESTÃO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link href="/admin/suggestions" className="flex items-center gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition group shadow-lg">
          <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 group-hover:scale-110 transition">💡</div>
          <div><h3 className="font-bold text-lg">Pedidos & Sugestões</h3><p className="text-sm text-gray-400">Ver o que pediram</p></div>
        </Link>
        <Link href="/admin/reports" className="flex items-center gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition group shadow-lg">
          <div className="bg-red-500/20 p-3 rounded-lg text-red-500 group-hover:scale-110 transition">🚩</div>
          <div><h3 className="font-bold text-lg">Reports de Erros</h3><p className="text-sm text-gray-400">Links quebrados e bugs</p></div>
        </Link>
      </div>

      <hr className="border-gray-800 mb-10" />

      {/* --- NOTIFICAÇÃO GLOBAL --- */}
      <section className="mb-12 bg-gradient-to-r from-gray-900 to-gray-900/50 p-6 rounded-xl border border-yellow-900/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-100">
          📢 Enviar Notificação Global
        </h2>
        {notifMsg && (
          <div className={`mb-4 rounded border px-3 py-2 text-sm ${notifMsg.type === "ok" ? "bg-green-900/40 border-green-700 text-green-200" : "bg-red-900/40 border-red-700 text-red-200"}`}>
            {notifMsg.text}
          </div>
        )}
        <div className="flex flex-col gap-3">
           <div className="flex flex-col md:flex-row gap-3">
              <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 focus:border-yellow-600 outline-none" placeholder="Mensagem (ex: Deadpool 3 disponível!)" />
              <input value={notifLink} onChange={(e) => setNotifLink(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 focus:border-yellow-600 outline-none" placeholder="Link (ex: /watch/movie/123)" />
           </div>
           
           {/* Preview da Imagem Selecionada */}
           <div className="flex items-center gap-4">
              <input value={notifImage} onChange={(e) => setNotifImage(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 focus:border-yellow-600 outline-none text-sm text-gray-400" placeholder="URL da Imagem (seleciona um filme abaixo para preencher auto)" />
              {notifImage && <img src={notifImage} alt="Preview" className="w-10 h-14 object-cover rounded border border-gray-600" />}
           </div>

           <button onClick={handleSendNotification} disabled={sendingNotif} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded transition disabled:opacity-50 w-full md:w-auto self-end">
            {sendingNotif ? "A enviar..." : "Enviar Notificação 🚀"}
          </button>
        </div>
      </section>

      <hr className="border-gray-800 mb-10" />

      {/* --- PESQUISA --- */}
      <h2 className="text-2xl font-bold mb-6">Gestor de Embeds</h2>
      {statusMsg && <div className={`mb-4 rounded border px-3 py-2 text-sm ${statusMsg.type === "ok" ? "bg-green-900/40 border-green-700 text-green-200" : "bg-red-900/40 border-red-700 text-red-200"}`}>{statusMsg.text}</div>}

      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-2">Procurar IDs no TMDB</h3>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2 w-full focus:border-red-600 outline-none" placeholder="Pesquisar filme/série…" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Filmes */}
          <div>
            <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Filmes</div>
            <div className="space-y-2 max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
              {movieHits.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 p-2 rounded-lg flex items-center gap-3 transition group border border-transparent hover:border-gray-700"
                  onClick={() => {
                    setMovieId(String(m.id));
                    setSelectedMovie(m);
                    // 👇 AUTO-PREENCHE A NOTIFICAÇÃO
                    setNotifTitle(`${m.title} já está disponível!`);
                    setNotifLink(`/watch/movie/${m.id}`);
                    setNotifImage(m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "");
                  }}
                >
                  <img src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "/no-image.jpg"} alt={m.title} className="w-10 h-14 object-cover rounded bg-gray-800 shadow" />
                  <div>
                    <div className="font-bold text-sm text-gray-200 group-hover:text-white line-clamp-1">{m.title}</div>
                    <div className="text-xs text-gray-500">ID: <span className="text-yellow-500">{m.id}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Séries */}
          <div>
            <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Séries</div>
            <div className="space-y-2 max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
              {seriesHits.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 p-2 rounded-lg flex items-center gap-3 transition group border border-transparent hover:border-gray-700"
                  onClick={() => {
                    setSeriesId(String(s.id));
                    setSelectedSeries(s);
                    // 👇 AUTO-PREENCHE A NOTIFICAÇÃO
                    setNotifTitle(`${s.name} - Novos episódios!`);
                    setNotifLink(`/series/${s.id}`);
                    setNotifImage(s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "");
                  }}
                >
                  <img src={s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "/no-image.jpg"} alt={s.name} className="w-10 h-14 object-cover rounded bg-gray-800 shadow" />
                  <div>
                    <div className="font-bold text-sm text-gray-200 group-hover:text-white line-clamp-1">{s.name}</div>
                    <div className="text-xs text-gray-500">ID: <span className="text-yellow-500">{s.id}</span></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Forms de Filmes e Séries (Mantidos) */}
      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-3">Adicionar Filme</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input value={movieId} onChange={(e) => setMovieId(e.target.value.trim())} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="ID TMDB" />
          <input value={movieUrl} onChange={(e) => setMovieUrl(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2 md:col-span-2" placeholder="URL do Embed" />
        </div>
        <div className="flex gap-3 mt-4">
            <button onClick={async () => { const { error } = await upsertMovieEmbed(movieId, movieUrl); if(error) setStatusMsg({type:'error', text:error.message}); else { setStatusMsg({type:'ok', text:'Guardado!'}); await refreshMovieEmbed(); } }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-bold">Guardar</button>
        </div>
      </section>

      <section className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-3">Adicionar Episódio</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <input value={seriesId} onChange={(e) => setSeriesId(e.target.value.trim())} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="ID Série" />
          <input value={season} onChange={(e) => setSeason(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="T" type="number" />
          <input value={episode} onChange={(e) => setEpisode(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="E" type="number" />
          <input value={epUrl} onChange={(e) => setEpUrl(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="URL" />
        </div>
        <div className="flex gap-3 mt-4">
            <button onClick={async () => { const { error } = await upsertEpisodeEmbed(seriesId, season, episode, epUrl); if(error) setStatusMsg({type:'error', text:error.message}); else { setStatusMsg({type:'ok', text:'Guardado!'}); await refreshEpisodeEmbed(); } }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-bold">Guardar</button>
        </div>
      </section>
    </main>
  );
}