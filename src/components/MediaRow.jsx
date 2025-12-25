"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MediaRow({ title, endpoint, type = "movie", itemsProp = null }) {
  const [items, setItems] = useState([]);
  const rowRef = useRef(null);
  
  let draggable = { events: () => ({}), style: {} };
  try {
    draggable = useDraggableScroll();
  } catch(e) {}

  useEffect(() => {
    if (itemsProp && itemsProp.length > 0) {
        setItems(itemsProp);
        return;
    }

    async function fetchData() {
      if (!endpoint) return; 
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
    fetchData();
  }, [endpoint, title, itemsProp]);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8 px-6 relative group/row z-20">
      <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-transparent hover:border-red-600 transition-colors cursor-pointer flex items-center gap-2">
        {title} 
        <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover/row:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </h2>

      <div 
        ref={rowRef}
        {...(draggable.events ? draggable.events(rowRef) : {})}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4"
        style={{ ...(draggable.style || {}), WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item) => {
          // LÓGICA DE LINK INTELIGENTE
          // 1. Se o item disser explicitamente que é 'tv' ou 'movie', usa isso.
          // 2. Se não disser nada, usa o tipo padrão da linha (prop 'type').
          // 3. Fallback: Se tiver 'name' em vez de 'title', assume que é série.
          const isSeries = 
            item.item_type === 'tv' || 
            item.media_type === 'tv' || 
            (!item.item_type && !item.media_type && type === 'tv') ||
            (!item.item_type && !item.media_type && !item.title && item.name); // Heurística de segurança

          const linkHref = isSeries ? `/series/${item.id}` : `/movies/${item.id}`;

          return (
            <Link
              key={item.id}
              href={linkHref}
              className="flex-none w-[150px] md:w-[180px] transition duration-300 ease-in-out hover:scale-105 hover:z-10 group/card select-none"
              draggable="false"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg border border-gray-800 hover:border-gray-600">
                <img
                  src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : "/no-image.jpg"}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover opacity-90 group-hover/card:opacity-100 transition pointer-events-none"
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
          );
        })}
      </div>
    </section>
  );
}