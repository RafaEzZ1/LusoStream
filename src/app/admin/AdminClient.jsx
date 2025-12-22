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
  const [allowed, setAllowed] = useState("loading");

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
  const [sendingNotif, setSendingNotif] = useState(false);

  // Ajuda TMDB
  const [search, setSearch] = useState("");
  const [movieHits, setMovieHits] = useState([]);
  const [seriesHits, setSeriesHits] = useState([]);
  
  // 👇 NOVO: Guardar o filme/série selecionado para mostrar a imagem
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedSeries, setSelectedSeries] = useState(null);

  // Feedback
  const [statusMsg, setStatusMsg] = useState(null);
  const [notifMsg, setNotifMsg] = useState(null);
  const [currentMovieEmbed, setCurrentMovieEmbed] = useState(null);
  const [currentEpisodeEmbed, setCurrentEpisodeEmbed] = useState(null);

  // Gate de permissões
  useEffect(() => {
    let active = true;
    (async () => {
      const { user, role } = await getUserAndRole();
      if (!active) return;
      if (!user) {
        setAllowed("denied");
        router.replace("/auth");
        return;
      }
      setAllowed(isModOrAdmin(role) ? "ok" : "denied");
      if (!isModOrAdmin(role)) router.replace("/");
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // Busca TMDB
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) {
        setMovieHits([]);
        setSeriesHits([]);
        return;
      }
      try {
        const [m, s] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
              search
            )}`
          ).then((r) => r.json()),
          fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
              search
            )}`
          ).then((r) => r.json()),
        ]);
        setMovieHits(m.results || []);
        setSeriesHits(s.results || []);
      } catch (e) {
        console.error(e);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  async function refreshMovieEmbed() {
    if (!movieId) { setCurrentMovieEmbed(null); return; }
    const url = await getMovieEmbed(movieId);
    setCurrentMovieEmbed(url);
  }
  async function refreshEpisodeEmbed() {
    if (!seriesId || !season || !episode) { setCurrentEpisodeEmbed(null); return; }
    const url = await getEpisodeEmbed(seriesId, season, episode);
    setCurrentEpisodeEmbed(url);
  }

  useEffect(() => { refreshMovieEmbed(); }, [movieId]);
  useEffect(() => { refreshEpisodeEmbed(); }, [seriesId, season, episode]);

  // Função para enviar notificação
  async function handleSendNotification() {
    if (!notifTitle.trim()) {
      setNotifMsg({ type: "error", text: "Escreve uma mensagem!" });
      return;
    }
    setSendingNotif(true);
    const { error } = await supabase.from("announcements").insert({
      title: notifTitle,
      link: notifLink || null
    });
    setSendingNotif(false);

    if (error) {
      setNotifMsg({ type: "error", text: error.message });
    } else {
      setNotifMsg({ type: "ok", text: "Notificação enviada a todos! 🚀" });
      setNotifTitle("");
      setNotifLink("");
    }
  }

  if (allowed === "loading") return <p className="pt-24 px-6 text-gray-400">A validar permissões…</p>;
  if (allowed === "denied") return <p className="pt-24 px-6">403 — Sem acesso.</p>;

  return (
    <main className="pt-24 px-6 max-w-6xl mx-auto pb-16 text-white">
      
      <h1 className="text-3xl font-bold mb-8 text-red-600 border-l-4 border-white pl-4">
        Painel de Administração
      </h1>

      {/* --- BOTÕES DE GESTÃO --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link 
          href="/admin/suggestions"
          className="flex items-center gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition group shadow-lg"
        >
          <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 group-hover:scale-110 transition">💡</div>
          <div>
            <h3 className="font-bold text-lg">Pedidos & Sugestões</h3>
            <p className="text-sm text-gray-400">Ver o que pediram</p>
          </div>
        </Link>
        <Link 
          href="/admin/reports"
          className="flex items-center gap-4 p-6 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 hover:border-gray-700 transition group shadow-lg"
        >
          <div className="bg-red-500/20 p-3 rounded-lg text-red-500 group-hover:scale-110 transition">🚩</div>
          <div>
            <h3 className="font-bold text-lg">Reports de Erros</h3>
            <p className="text-sm text-gray-400">Links quebrados e bugs</p>
          </div>
        </Link>
      </div>

      <hr className="border-gray-800 mb-10" />

      {/* --- NOTIFICAÇÃO GLOBAL --- */}
      <section className="mb-12 bg-gradient-to-r from-gray-900 to-gray-900/50 p-6 rounded-xl border border-yellow-900/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-100">
          📢 Enviar Notificação Global
        </h2>
        {notifMsg && (
          <div className={`mb-4 rounded border px-3 py-2 text-sm ${
            notifMsg.type === "ok" ? "bg-green-900/40 border-green-700 text-green-200" : "bg-red-900/40 border-red-700 text-red-200"
          }`}>
            {notifMsg.text}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-3">
          <input value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 focus:border-yellow-600 outline-none" placeholder="Mensagem (ex: Deadpool 3 já disponível!)" />
          <input value={notifLink} onChange={(e) => setNotifLink(e.target.value)} className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 focus:border-yellow-600 outline-none" placeholder="Link (ex: /watch/movie/123)" />
          <button onClick={handleSendNotification} disabled={sendingNotif} className="bg-yellow-700 hover:bg-yellow-600 text-white font-bold px-6 py-2 rounded transition disabled:opacity-50">
            {sendingNotif ? "A enviar..." : "Enviar 🚀"}
          </button>
        </div>
      </section>

      <hr className="border-gray-800 mb-10" />

      {/* --- GESTOR DE EMBEDS --- */}
      <h2 className="text-2xl font-bold mb-6">Gestor de Embeds</h2>

      {statusMsg && (
        <div className={`mb-4 rounded border px-3 py-2 text-sm ${
          statusMsg.type === "ok" ? "bg-green-900/40 border-green-700 text-green-200" : "bg-red-900/40 border-red-700 text-red-200"
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. SECÇÃO DE PESQUISA COM IMAGENS */}
      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-2">Procurar IDs no TMDB</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-black border border-gray-700 rounded px-3 py-2 w-full focus:border-red-600 outline-none"
          placeholder="Pesquisar filme/série…"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          {/* Resultados FILMES */}
          <div>
            <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Filmes</div>
            <div className="space-y-2 max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
              {movieHits.length === 0 && search && <p className="text-gray-600 text-sm">Sem resultados.</p>}
              {movieHits.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 p-2 rounded-lg flex items-center gap-3 transition group border border-transparent hover:border-gray-700"
                  onClick={() => {
                    setMovieId(String(m.id));
                    setSelectedMovie(m); // Guardar para preview
                  }}
                >
                  {/* Poster Pequeno */}
                  <img 
                    src={m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "/no-image.jpg"} 
                    alt={m.title}
                    className="w-10 h-14 object-cover rounded bg-gray-800 shadow"
                  />
                  <div>
                    <div className="font-bold text-sm text-gray-200 group-hover:text-white line-clamp-1">{m.title}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>ID: <span className="text-yellow-500">{m.id}</span></span>
                      <span>• {m.release_date ? m.release_date.split('-')[0] : 'N/A'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Resultados SÉRIES */}
          <div>
            <div className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Séries</div>
            <div className="space-y-2 max-h-96 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 pr-2">
              {seriesHits.length === 0 && search && <p className="text-gray-600 text-sm">Sem resultados.</p>}
              {seriesHits.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 p-2 rounded-lg flex items-center gap-3 transition group border border-transparent hover:border-gray-700"
                  onClick={() => {
                    setSeriesId(String(s.id));
                    setSelectedSeries(s); // Guardar para preview
                  }}
                >
                  {/* Poster Pequeno */}
                  <img 
                    src={s.poster_path ? `https://image.tmdb.org/t/p/w92${s.poster_path}` : "/no-image.jpg"} 
                    alt={s.name}
                    className="w-10 h-14 object-cover rounded bg-gray-800 shadow"
                  />
                  <div>
                    <div className="font-bold text-sm text-gray-200 group-hover:text-white line-clamp-1">{s.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>ID: <span className="text-yellow-500">{s.id}</span></span>
                      <span>• {s.first_air_date ? s.first_air_date.split('-')[0] : 'N/A'}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. FORMULÁRIO FILME */}
      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
          🎬 Adicionar Filme
        </h3>

        {/* 👇 PREVIEW DO FILME SELECIONADO */}
        {selectedMovie && selectedMovie.id.toString() === movieId && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-black/40 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-2">
             <img 
                src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/w154${selectedMovie.poster_path}` : "/no-image.jpg"} 
                className="w-16 h-24 rounded shadow-lg object-cover"
             />
             <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Vais adicionar:</p>
                <p className="font-bold text-xl text-white">{selectedMovie.title}</p>
                <p className="text-sm text-gray-500">ID: {selectedMovie.id}</p>
             </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={movieId}
            onChange={(e) => setMovieId(e.target.value.trim())}
            className="bg-black border border-gray-700 rounded px-3 py-2 focus:border-red-600 outline-none"
            placeholder="TMDB Movie ID"
          />
          <input
            value={movieUrl}
            onChange={(e) => setMovieUrl(e.target.value)}
            className="bg-black border border-gray-700 rounded px-3 py-2 md:col-span-2 focus:border-red-600 outline-none"
            placeholder="URL do player (ex: https://mixdrop.to/e/...)"
          />
        </div>

        {movieId && (
          <div className="mt-2 text-sm text-gray-300">
            Link atual na base de dados:{" "}
            {currentMovieEmbed ? (
              <a href={currentMovieEmbed} target="_blank" rel="noreferrer" className="text-blue-300 underline break-all">
                {currentMovieEmbed}
              </a>
            ) : (
              <span className="text-gray-500 italic">Nenhum</span>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={async () => {
              setStatusMsg(null);
              if (!movieId || !movieUrl) {
                setStatusMsg({ type: "error", text: "Preenche Movie ID e URL." });
                return;
              }
              const { error } = await upsertMovieEmbed(movieId, movieUrl);
              if (error) {
                setStatusMsg({ type: "error", text: `Erro a guardar: ${error.message}` });
              } else {
                setStatusMsg({ type: "ok", text: "Guardado com sucesso! ✔" });
                setMovieUrl("");
                await refreshMovieEmbed();
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold transition text-white shadow-lg shadow-red-900/20"
          >
            Guardar Filme
          </button>
          <button
            onClick={async () => {
              setStatusMsg(null);
              if (!movieId) {
                setStatusMsg({ type: "error", text: "Indica o Movie ID." });
                return;
              }
              const { error } = await deleteMovieEmbed(movieId);
              if (error) {
                setStatusMsg({ type: "error", text: `Erro a remover: ${error.message}` });
              } else {
                setStatusMsg({ type: "ok", text: "Filme removido! ✔" });
                await refreshMovieEmbed();
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition text-gray-300 hover:text-white"
          >
            Remover
          </button>
        </div>
      </section>

      {/* 3. FORMULÁRIO EPISÓDIO */}
      <section className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
          📺 Adicionar Episódio
        </h3>

        {/* 👇 PREVIEW DA SÉRIE SELECIONADA */}
        {selectedSeries && selectedSeries.id.toString() === seriesId && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-black/40 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-2">
             <img 
                src={selectedSeries.poster_path ? `https://image.tmdb.org/t/p/w154${selectedSeries.poster_path}` : "/no-image.jpg"} 
                className="w-16 h-24 rounded shadow-lg object-cover"
             />
             <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Vais adicionar à série:</p>
                <p className="font-bold text-xl text-white">{selectedSeries.name}</p>
                <p className="text-sm text-gray-500">ID: {selectedSeries.id}</p>
             </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-3">
          <input
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value.trim())}
            className="bg-black border border-gray-700 rounded px-3 py-2 focus:border-red-600 outline-none"
            placeholder="TMDB Series ID"
          />
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="bg-black border border-gray-700 rounded px-3 py-2 focus:border-red-600 outline-none"
            placeholder="Temp."
            type="number"
            min="0"
          />
          <input
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            className="bg-black border border-gray-700 rounded px-3 py-2 focus:border-red-600 outline-none"
            placeholder="Ep."
            type="number"
            min="1"
          />
          <input
            value={epUrl}
            onChange={(e) => setEpUrl(e.target.value)}
            className="bg-black border border-gray-700 rounded px-3 py-2 md:col-span-1 focus:border-red-600 outline-none"
            placeholder="URL do player"
          />
        </div>

        {seriesId && season && episode && (
          <div className="mt-2 text-sm text-gray-300">
            Link atual na base de dados:{" "}
            {currentEpisodeEmbed ? (
              <a href={currentEpisodeEmbed} target="_blank" rel="noreferrer" className="text-blue-300 underline break-all">
                {currentEpisodeEmbed}
              </a>
            ) : (
              <span className="text-gray-500 italic">Nenhum</span>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={async () => {
              setStatusMsg(null);
              if (!seriesId || !season || !episode || !epUrl) {
                setStatusMsg({ type: "error", text: "Preenche tudo." });
                return;
              }
              const { error } = await upsertEpisodeEmbed(seriesId, season, episode, epUrl);
              if (error) {
                setStatusMsg({ type: "error", text: `Erro a guardar: ${error.message}` });
              } else {
                setStatusMsg({ type: "ok", text: "Episódio guardado! ✔" });
                setEpUrl("");
                await refreshEpisodeEmbed();
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold transition text-white shadow-lg shadow-red-900/20"
          >
            Guardar Episódio
          </button>
          <button
            onClick={async () => {
              setStatusMsg(null);
              if (!seriesId || !season || !episode) {
                setStatusMsg({ type: "error", text: "Indica ID, temporada e episódio." });
                return;
              }
              const { error } = await deleteEpisodeEmbed(seriesId, season, episode);
              if (error) {
                setStatusMsg({ type: "error", text: `Erro a remover: ${error.message}` });
              } else {
                setStatusMsg({ type: "ok", text: "Episódio removido! ✔" });
                await refreshEpisodeEmbed();
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition text-gray-300 hover:text-white"
          >
            Remover
          </button>
        </div>
      </section>
    </main>
  );
}