"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function Recommendations({ type, id }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchRecs() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/recommendations?api_key=${API_KEY}&language=pt-BR&page=1`);
        const data = await res.json();
        setItems(data.results || []);
      } catch (e) { console.error(e); }
    }
    if (id) fetchRecs();
  }, [type, id]);

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">
        Também poderás gostar
      </h3>
      
      {/* Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 custom-scrollbar scroll-smooth">
        {items.slice(0, 10).map((item) => (
          <Link 
            key={item.id} 
            href={type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
            className="flex-shrink-0 w-40 group relative rounded-lg overflow-hidden bg-gray-800"
          >
             {item.poster_path ? (
               <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition duration-500" />
             ) : (
               <div className="w-full aspect-[2/3] flex items-center justify-center text-xs text-gray-500">Sem Capa</div>
             )}
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-center p-2">
               <span className="text-xs font-bold text-white">{item.title || item.name}</span>
             </div>
          </Link>
        ))}
      </div>
    </div>
  );
}