// src/app/admin/AdminClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [allowed, setAllowed] = useState("loading"); // 'loading' | 'ok' | 'denied'

  // Forms
  const [movieId, setMovieId] = useState("");
  const [movieUrl, setMovieUrl] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [epUrl, setEpUrl] = useState("");

  // Ajuda TMDB
  const [search, setSearch] = useState("");
  const [movieHits, setMovieHits] = useState([]);
  const [seriesHits, setSeriesHits] = useState([]);

  // Feedback
  const [statusMsg, setStatusMsg] = useState(null);
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

  // Busca TMDB (debounce simples)
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

  if (allowed === "loading") {
    return <p className="pt-24 px-6 text-gray-400">A validar permissões…</p>;
  }
  if (allowed === "denied") {
    return <p className="pt-24 px-6">403 — Sem acesso.</p>;
  }

  return (
    <main className="pt-24 px-6 max-w-5xl mx-auto pb-16">
      <h1 className="text-3xl font-bold mb-4">Admin — Embeds</h1>

      {statusMsg && (
        <div className={`mb-4 rounded border px-3 py-2 text-sm ${
          statusMsg.type === "ok"
            ? "bg-green-900/40 border-green-700 text-green-200"
            : "bg-red-900/40 border-red-700 text-red-200"
        }`}>
          {statusMsg.text}
        </div>
      )}

      {/* Procurar IDs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Procurar IDs no TMDB</h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded px-3 py-2 w-full"
          placeholder="Pesquisar filme/série…"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Filmes</div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {movieHits.map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 rounded px-3 py-2"
                  onClick={() => setMovieId(String(m.id))}
                >
                  {m.title} <span className="text-gray-400">#{m.id}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-2">Séries</div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {seriesHits.map((s) => (
                <button
                  key={s.id}
                  className="w-full text-left bg-gray-900 hover:bg-gray-800 rounded px-3 py-2"
                  onClick={() => setSeriesId(String(s.id))}
                >
                  {s.name} <span className="text-gray-400">#{s.id}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filme */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Adicionar/Atualizar Filme</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            value={movieId}
            onChange={(e) => setMovieId(e.target.value.trim())}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2"
            placeholder="TMDB Movie ID (ex: 756999)"
          />
          <input
            value={movieUrl}
            onChange={(e) => setMovieUrl(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2 md:col-span-2"
            placeholder="URL do player (ex: https://mxdrop.to/e/...)"
          />
        </div>

        {movieId && (
          <div className="mt-2 text-sm text-gray-300">
            Atual:{" "}
            {currentMovieEmbed ? (
              <a href={currentMovieEmbed} target="_blank" rel="noreferrer" className="text-blue-300 underline">
                {currentMovieEmbed}
              </a>
            ) : (
              <span className="text-gray-500">— (nenhum)</span>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-3">
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
                setStatusMsg({ type: "ok", text: "Guardado ✔" });
                setMovieUrl("");
                await refreshMovieEmbed();
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Guardar
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
                setStatusMsg({ type: "ok", text: "Removido ✔" });
                await refreshMovieEmbed();
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Remover
          </button>
        </div>
      </section>

      {/* Episódio */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Adicionar/Atualizar Episódio</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <input
            value={seriesId}
            onChange={(e) => setSeriesId(e.target.value.trim())}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2"
            placeholder="TMDB Series ID"
          />
          <input
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2"
            placeholder="Temporada"
            type="number"
            min="0"
          />
          <input
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2"
            placeholder="Episódio"
            type="number"
            min="1"
          />
          <input
            value={epUrl}
            onChange={(e) => setEpUrl(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded px-3 py-2 md:col-span-1"
            placeholder="URL do player"
          />
        </div>

        {seriesId && season && episode && (
          <div className="mt-2 text-sm text-gray-300">
            Atual:{" "}
            {currentEpisodeEmbed ? (
              <a href={currentEpisodeEmbed} target="_blank" rel="noreferrer" className="text-blue-300 underline">
                {currentEpisodeEmbed}
              </a>
            ) : (
              <span className="text-gray-500">— (nenhum)</span>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-3">
          <button
            onClick={async () => {
              setStatusMsg(null);
              if (!seriesId || !season || !episode || !epUrl) {
                setStatusMsg({ type: "error", text: "Preenche ID/Temporada/Episódio/URL." });
                return;
              }
              const { error } = await upsertEpisodeEmbed(seriesId, season, episode, epUrl);
              if (error) {
                setStatusMsg({ type: "error", text: `Erro a guardar: ${error.message}` });
              } else {
                setStatusMsg({ type: "ok", text: "Guardado ✔" });
                setEpUrl("");
                await refreshEpisodeEmbed();
              }
            }}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Guardar
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
                setStatusMsg({ type: "ok", text: "Removido ✔" });
                await refreshEpisodeEmbed();
              }
            }}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Remover
          </button>
        </div>
      </section>
    </main>
  );
}
