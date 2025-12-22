// src/components/MediaRow.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MediaRow({ title, endpoint, type = "movie" }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${endpoint}&api_key=${API_KEY}&language=pt-BR`
        );
        const data = await res.json();
        setItems(data.results || []);
      } catch (e) {
        console.error("Erro ao carregar fila:", title, e);
      }
    }
    fetchData();
  }, [endpoint, title]);

  if (!items.length) return null;

  return (
    <section className="mb-10 px-6 relative group/row">
      <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-transparent hover:border-red-600 transition-colors cursor-pointer flex items-center gap-2">
        {title} 
        <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover/row:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </h2>

      <div 
        ref={rowRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4 scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
            className="flex-none w-[150px] md:w-[180px] transition duration-300 ease-in-out hover:scale-105 hover:z-10 group/card"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg border border-gray-800 hover:border-gray-600">
              <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/no-image.jpg"}
                alt={item.title || item.name}
                className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 transition"
                loading="lazy"
              />
              
              {/* Overlay Escura ao passar o rato */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-yellow-400 mb-1">★ {item.vote_average?.toFixed(1)}</span>
                <p className="text-[10px] text-gray-300 line-clamp-2 leading-tight">{item.overview || "Sem descrição."}</p>
              </div>
            </div>
            
            <div className="mt-2 px-1">
              <h3 className="text-sm font-medium text-gray-200 truncate group-hover/card:text-white transition">
                {item.title || item.name}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}