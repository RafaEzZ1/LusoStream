// src/app/HomeClient.jsx
"use client";

import { useEffect, useState } from "react";
import Carousel from "@/components/Carousel";
import { listContinueWatching } from "@/lib/progress";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HomeClient() {
  const [continueItems, setContinueItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // CONTINUAR A VER
  useEffect(() => {
    async function loadContinue() {
      const { ok, items } = await listContinueWatching(20);
      if (!ok || !items?.length) {
        setContinueItems([]);
        return;
      }

      const enriched = await Promise.all(
        items.map(async (row) => {
          try {
            if (row.item_type === "movie") {
              const r = await fetch(
                `https://api.themoviedb.org/3/movie/${row.item_id}?api_key=${API_KEY}&language=pt-BR`
              );
              const d = await r.json();
              if (!d?.id) return null;
              return {
                id: d.id,
                type: "movie",
                title: d.title,
                name: d.title,
                poster_path: d.poster_path,
                image: d.poster_path
                  ? `https://image.tmdb.org/t/p/w342${d.poster_path}`
                  : "/no-image.jpg",
                // para o Carousel saber que é da watchlist
                _fromProgress: true,
              };
            } else {
              const r = await fetch(
                `https://api.themoviedb.org/3/tv/${row.item_id}?api_key=${API_KEY}&language=pt-BR`
              );
              const d = await r.json();
              if (!d?.id) return null;

              const season = row.season ?? null;
              const episode = row.episode ?? null;

              return {
                id: d.id,
                type: "series",
                title: d.name,
                name: d.name,
                poster_path: d.poster_path,
                image: d.poster_path
                  ? `https://image.tmdb.org/t/p/w342${d.poster_path}`
                  : "/no-image.jpg",
                // isto aparece no subtítulo
                progressLabel:
                  season && episode
                    ? `T${season} • E${episode}`
                    : season
                    ? `T${season}`
                    : "A ver",
                _fromProgress: true,
              };
            }
          } catch (e) {
            console.warn("erro enriquecer continuar a ver:", e);
            return null;
          }
        })
      );

      setContinueItems(enriched.filter(Boolean));
    }

    loadContinue();

    // se mudares de tab e voltares, refresca
    function onVis() {
      if (document.visibilityState === "visible") {
        loadContinue();
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // OUTRAS SECÇÕES
  useEffect(() => {
    async function loadSections() {
      setLoading(true);
      try {
        const conf = [
          {
            title: "Filmes em alta",
            url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=pt-BR`,
            type: "movie",
          },
          {
            title: "Séries em alta",
            url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}&language=pt-BR`,
            type: "series",
          },
          {
            title: "Ação",
            url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28&language=pt-BR&sort_by=popularity.desc`,
            type: "movie",
          },
            {
            title: "Comédia",
            url: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35&language=pt-BR&sort_by=popularity.desc`,
            type: "movie",
          },
          {
            title: "Animes / animação",
            url: `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=16&language=pt-BR&sort_by=popularity.desc`,
            type: "series",
          },
          {
            title: "Séries melhor avaliadas",
            url: `https://api.themoviedb.org/3/tv/top_rated?api_key=${API_KEY}&language=pt-BR`,
            type: "series",
          },
        ];

        const fetched = await Promise.all(
          conf.map(async (c) => {
            const r = await fetch(c.url);
            const d = await r.json();
            const items = (d.results || []).map((it) => ({
              ...it,
              type: c.type === "movie" ? "movie" : "series",
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

  return (
    <div className="pt-24 pb-14 px-4 md:px-6 space-y-8">
      {continueItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Continuar a ver</h2>
          <Carousel items={continueItems} />
        </div>
      )}

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
