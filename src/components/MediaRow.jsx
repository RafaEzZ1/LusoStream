// src/components/MediaRow.jsx
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; // 👇 Importar Hook

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MediaRow({ title, endpoint, type = "movie", itemsProp = null }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);
  const { events, style } = useDraggableScroll(); // 👇 Usar Hook

  useEffect(() => {
    // Se passarmos itens diretamente (para a Minha Lista), usa esses
    if (itemsProp) {
        setItems(itemsProp);
        return;
    }

    // Caso contrário, vai buscar ao TMDB
    async function fetchData() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${endpoint}&api_key=${API_KEY}&language=pt-BR`
        );
        const data = await res.json();
        setItems(data.results || []);
      } catch (e) {
        console.error("Erro row:", title, e);
      }
    }
    if (endpoint) fetchData();
  }, [endpoint, title, itemsProp]);

  if (!items.length) return null;

  return (
    <section className="mb-8 px-6 relative group/row z-20"> {/* z-20 para ficar acima do Hero */}
      <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-transparent hover:border-red-600 transition-colors cursor-pointer flex items-center gap-2">
        {title} 
        <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover/row:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </h2>

      <div 
        ref={rowRef}
        {...events(rowRef)} // 👈 Ativar eventos de arrastar
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4"
        style={{ ...style, WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={type === "movie" || item.item_type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
            className="flex-none w-[150px] md:w-[180px] transition duration-300 ease-in-out hover:scale-105 hover:z-10 group/card select-none" // select-none importante
            draggable="false" // impedir drag nativo da imagem
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg border border-gray-800 hover:border-gray-600">
              <img
                src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/no-image.jpg"}
                alt={item.title || item.name}
                className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 transition pointer-events-none" // pointer-events-none ajuda no drag
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-yellow-400 mb-1">★ {item.vote_average?.toFixed(1)}</span>
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