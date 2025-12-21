// src/app/HomeClient.jsx
"use client";

import { useEffect, useState } from "react";
import Carousel from "@/components/Carousel";
import { listContinueWatching } from "@/lib/progress";
import { supabase } from "@/lib/supabaseClient"; // Importar supabase

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const [continueItems, setContinueItems] = useState([]);
  const [watchlistItems, setWatchlistItems] = useState([]); // Nova lista
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARREGAR "CONTINUAR A VER"
  useEffect(() => {
    async function loadContinue() {
      const { ok, items } = await listContinueWatching(20);
      if (!ok || !items?.length) {
        setContinueItems([]);
        return;
      }
      const enriched = await enrichItems(items); // Função auxiliar abaixo
      setContinueItems(enriched);
    }
    loadContinue();

    // Recarregar ao voltar à aba
    function onVis() {
      if (document.visibilityState === "visible") loadContinue();
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // 2. NOVO: CARREGAR "MINHA LISTA"
  useEffect(() => {
    async function loadWatchlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data?.length) {
        const enriched = await enrichItems(data);
        setWatchlistItems(enriched);
      }
    }
    loadWatchlist();
  }, []);

  // 3. CARREGAR AS OUTRAS SECÇÕES (Em alta, Ação, etc.)
  useEffect(() => {
    async function loadSections() {
      setLoading(true);
      try {
        const conf = [
          { title: "Filmes em alta", url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=pt-BR`, type: "movie" },
          { title: "Séries em alta", url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=pt-BR`, type: "series" },
          { title: "Ação", url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28&language=pt-BR&sort_by=popularity.desc`, type: "movie" },
          { title: "Comédia", url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35&language=pt-BR&sort_by=popularity.desc`, type: "movie" },
          { title: "Animes", url: `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&language=pt-BR&sort_by=popularity.desc`, type: "series" },
        ];

        const fetched = await Promise.all(
          conf.map(async (c) => {
            const r = await fetch(c.url);
            const d = await r.json();
            const items = (d.results || []).map((it) => ({
              ...it,
              type: c.type, // Forçar o tipo correto
            }));
            return { title: c.title, items };
          })
        );
        setSections(fetched);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSections();
  }, []);

  // Função auxiliar para ir buscar dados ao TMDB (usada pelo Continue e Watchlist)
  async function enrichItems(rows) {
    const enriched = await Promise.all(
      rows.map(async (row) => {
        try {
          const type = row.item_type || row.type; // Ajuste para suportar ambas as tabelas
          const id = row.item_id || row.id;

          if (type === "movie") {
            const r = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
            const d = await r.json();
            if (!d?.id) return null;
            return {
              id: d.id,
              type: "movie",
              title: d.title,
              name: d.title,
              poster_path: d.poster_path,
              image: d.poster_path ? `https://image.tmdb.org/t/p/w342${d.poster_path}` : "/no-image.jpg",
              _fromProgress: true, // Apenas visual
            };
          } else {
            const r = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR`);
            const d = await r.json();
            if (!d?.id) return null;
            return {
              id: d.id,
              type: "series",
              title: d.name,
              name: d.name,
              poster_path: d.poster_path,
              image: d.poster_path ? `https://image.tmdb.org/t/p/w342${d.poster_path}` : "/no-image.jpg",
              progressLabel: row.season ? `T${row.season} E${row.episode}` : null,
              _fromProgress: true,
            };
          }
        } catch (e) {
          return null;
        }
      })
    );
    return enriched.filter(Boolean);
  }

  return (
    <div className="pt-24 pb-14 px-4 md:px-6 space-y-8">
      {/* 1. Continue Watching */}
      {continueItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-2 border-l-4 border-red-600 pl-3">Continuar a ver</h2>
          <Carousel items={continueItems} />
        </div>
      )}

      {/* 2. Minha Lista (Watchlist) */}
      {watchlistItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-2 border-l-4 border-green-500 pl-3">Minha Lista</h2>
          <Carousel items={watchlistItems} />
        </div>
      )}

      {/* 3. Outras Secções */}
      {loading ? (
        <p className="text-gray-400">A carregar…</p>
      ) : (
        sections.map((sec, i) =>
          sec.items?.length ? (
            <div key={i}>
              <h2 className="text-2xl font-bold mb-2">{sec.title}</h2>
              <Carousel items={sec.items} />
            </div>
          ) : null
        )
      )}
    </div>
  );
}