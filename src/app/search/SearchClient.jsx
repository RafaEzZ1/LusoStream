// src/app/search/SearchClient.jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("query") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Atualiza o título da aba no cliente (opcional, se não usares DynamicTitle aqui)
  useEffect(() => {
    if (query) document.title = `Resultados: ${query} - LusoStream`;
  }, [query]);

  useEffect(() => {
    let aborted = false;

    async function run() {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [mRes, tRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
              query
            )}`
          ),
          fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(
              query
            )}`
          ),
        ]);
        const [mData, tData] = await Promise.all([mRes.json(), tRes.json()]);

        if (aborted) return;

        const combined = [
          ...(mData?.results || []).map((m) => ({ ...m, type: "movie" })),
          ...(tData?.results || []).map((t) => ({ ...t, type: "tv" })),
        ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

        setResults(combined);
      } catch (e) {
        console.error("Erro na pesquisa:", e);
        setResults([]);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [query]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {query ? `Resultados para “${query}”` : "Pesquisar"}
      </h1>

      {loading ? (
        <p className="text-gray-400">A carregar…</p>
      ) : results.length === 0 ? (
        <p className="text-gray-400">Nenhum resultado encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {results.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() =>
                router.push(item.type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`)
              }
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <img
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                    : "/no-image.jpg"
                }
                alt={item.title || item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 transition-opacity duration-300">
                <h2 className="text-white text-sm font-semibold drop-shadow-md">
                  {item.title || item.name}
                </h2>
                <p className="text-gray-300 text-xs">
                  {item.type === "movie" ? "Filme" : "Série"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
