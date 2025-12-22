// src/components/Recommendations.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function Recommendations({ type, id }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Busca filmes/séries similares ao atual
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${API_KEY}&language=pt-BR&page=1`
        );
        const data = await res.json();
        // Vamos mostrar apenas os primeiros 6
        setItems((data.results || []).slice(0, 6));
      } catch (e) {
        console.error("Erro recomendações:", e);
      }
    }
    if (id) fetchData();
  }, [type, id]);

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-red-600 pl-3">
        Recomendados para ti
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
            className="group relative bg-gray-900 rounded-lg overflow-hidden transition hover:scale-105 hover:z-10 shadow-lg"
          >
            {/* Poster */}
            <div className="aspect-[2/3] relative">
              <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/no-image.jpg"}
                alt={item.title || item.name}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
              />
              
              {/* Overlay com info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <span className="text-xs font-bold text-yellow-400">★ {item.vote_average?.toFixed(1)}</span>
              </div>
            </div>

            {/* Título */}
            <div className="p-2">
              <h4 className="text-sm font-semibold text-gray-200 truncate group-hover:text-white">
                {item.title || item.name}
              </h4>
              <p className="text-xs text-gray-500">
                {(item.release_date || item.first_air_date || "").split("-")[0]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}