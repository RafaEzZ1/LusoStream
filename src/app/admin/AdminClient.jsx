"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserAndRole, isModOrAdmin } from "@/lib/roles";
import { upsertMovieEmbed, deleteMovieEmbed, upsertEpisodeEmbed, deleteEpisodeEmbed, getMovieEmbed, getEpisodeEmbed } from "@/lib/embeds";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AdminClient() {
  const router = useRouter();
  const [allowed, setAllowed] = useState("loading");
  
  // -- A TUA LÓGICA DE EMBEDS --
  const [movieId, setMovieId] = useState("");
  const [movieUrl, setMovieUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [epUrl, setEpUrl] = useState("");
  const [search, setSearch] = useState("");
  const [movieHits, setMovieHits] = useState([]);
  const [seriesHits, setSeriesHits] = useState([]);
  const [statusMsg, setStatusMsg] = useState(null);
  const [currentMovieEmbed, setCurrentMovieEmbed] = useState(null);
  const [currentEpisodeEmbed, setCurrentEpisodeEmbed] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { user, role } = await getUserAndRole();
      if (!active) return;
      if (!user) { setAllowed("denied"); router.replace("/auth"); return; }
      setAllowed(isModOrAdmin(role) ? "ok" : "denied");
      if (!isModOrAdmin(role)) router.replace("/");
    })();
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setMovieHits([]); setSeriesHits([]); return; }
      try {
        const [m, s] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(search)}`).then(r => r.json()),
          fetch(`https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(search)}`).then(r => r.json()),
        ]);
        setMovieHits(m.results || []); setSeriesHits(s.results || []);
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

  if (allowed === "loading") return <p className="pt-24 px-6 text-gray-400">A validar permissões…</p>;
  if (allowed === "denied") return <p className="pt-24 px-6">403 — Sem acesso.</p>;

  return (
    <main className="pt-24 px-6 max-w-6xl mx-auto pb-16 text-white">
      {/* HEADER E BOTÕES NOVOS */}
      <h1 className="text-3xl font-bold mb-8 text-red-600 border-l-4 border-white pl-4">Painel de Administração</h1>
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

      {/* GESTOR DE EMBEDS (O TEU CÓDIGO) */}
      <h2 className="text-2xl font-bold mb-6">Gestor de Embeds</h2>
      {statusMsg && <div className={`mb-4 rounded border px-3 py-2 text-sm ${statusMsg.type === "ok" ? "bg-green-900/40 border-green-700 text-green-200" : "bg-red-900/40 border-red-700 text-red-200"}`}>{statusMsg.text}</div>}

      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-2">Procurar IDs no TMDB</h3>
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2 w-full focus:border-red-600 outline-none" placeholder="Pesquisar filme/série…" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div><div className="text-sm text-gray-400 mb-2">Filmes</div><div className="space-y-2 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-gray-700">{movieHits.map((m) => (<button key={m.id} className="w-full text-left bg-gray-900 hover:bg-gray-800 rounded px-3 py-2 text-sm" onClick={() => setMovieId(String(m.id))}>{m.title} <span className="text-gray-500">#{m.id}</span></button>))}</div></div>
          <div><div className="text-sm text-gray-400 mb-2">Séries</div><div className="space-y-2 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-gray-700">{seriesHits.map((s) => (<button key={s.id} className="w-full text-left bg-gray-900 hover:bg-gray-800 rounded px-3 py-2 text-sm" onClick={() => setSeriesId(String(s.id))}>{s.name} <span className="text-gray-500">#{s.id}</span></button>))}</div></div>
        </div>
      </section>

      <section className="mb-10 bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-3">Adicionar/Atualizar Filme</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <input value={movieId} onChange={(e) => setMovieId(e.target.value.trim())} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="TMDB Movie ID" />
          <input value={movieUrl} onChange={(e) => setMovieUrl(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2 md:col-span-2" placeholder="URL do player" />
        </div>
        {movieId && <div className="mt-2 text-sm text-gray-300">Atual: {currentMovieEmbed ? <a href={currentMovieEmbed} target="_blank" className="text-blue-300 underline">{currentMovieEmbed}</a> : <span className="text-gray-500">—</span>}</div>}
        <div className="flex gap-3 mt-4">
          <button onClick={async () => { setStatusMsg(null); if (!movieId || !movieUrl) { setStatusMsg({ type: "error", text: "Preenche ID e URL." }); return; } const { error } = await upsertMovieEmbed(movieId, movieUrl); if (error) setStatusMsg({ type: "error", text: error.message }); else { setStatusMsg({ type: "ok", text: "Guardado ✔" }); setMovieUrl(""); await refreshMovieEmbed(); } }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition">Guardar</button>
          <button onClick={async () => { setStatusMsg(null); if (!movieId) return; const { error } = await deleteMovieEmbed(movieId); if (error) setStatusMsg({ type: "error", text: error.message }); else { setStatusMsg({ type: "ok", text: "Removido ✔" }); await refreshMovieEmbed(); } }} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition">Remover</button>
        </div>
      </section>

      <section className="bg-gray-900/30 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-semibold mb-3">Adicionar/Atualizar Episódio</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <input value={seriesId} onChange={(e) => setSeriesId(e.target.value.trim())} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="TMDB Series ID" />
          <input value={season} onChange={(e) => setSeason(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="Temp." type="number" />
          <input value={episode} onChange={(e) => setEpisode(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="Ep." type="number" />
          <input value={epUrl} onChange={(e) => setEpUrl(e.target.value)} className="bg-black border border-gray-700 rounded px-3 py-2" placeholder="URL do player" />
        </div>
        {seriesId && season && episode && <div className="mt-2 text-sm text-gray-300">Atual: {currentEpisodeEmbed ? <a href={currentEpisodeEmbed} target="_blank" className="text-blue-300 underline">{currentEpisodeEmbed}</a> : <span className="text-gray-500">—</span>}</div>}
        <div className="flex gap-3 mt-4">
          <button onClick={async () => { setStatusMsg(null); if (!seriesId || !season || !episode || !epUrl) { setStatusMsg({ type: "error", text: "Preenche tudo." }); return; } const { error } = await upsertEpisodeEmbed(seriesId, season, episode, epUrl); if (error) setStatusMsg({ type: "error", text: error.message }); else { setStatusMsg({ type: "ok", text: "Guardado ✔" }); setEpUrl(""); await refreshEpisodeEmbed(); } }} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition">Guardar</button>
          <button onClick={async () => { setStatusMsg(null); if (!seriesId || !season || !episode) return; const { error } = await deleteEpisodeEmbed(seriesId, season, episode); if (error) setStatusMsg({ type: "error", text: error.message }); else { setStatusMsg({ type: "ok", text: "Removido ✔" }); await refreshEpisodeEmbed(); } }} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded transition">Remover</button>
        </div>
      </section>
    </main>
  );
}