// src/components/ContinueWatching.jsx
"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; // 👇

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

function ContinueCard({ item }) {
  const [image, setImage] = useState(null);
  const isMovie = item.item_type === "movie";

  useEffect(() => {
    let active = true;
    async function fetchImage() {
      try {
        let url = "";
        if (isMovie) {
          url = `https://api.themoviedb.org/3/movie/${item.item_id}?api_key=${API_KEY}&language=pt-BR`;
        } else {
          url = `https://api.themoviedb.org/3/tv/${item.item_id}/season/${item.season}/episode/${item.episode}?api_key=${API_KEY}&language=pt-BR`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (active) {
          const imgPath = isMovie ? data.backdrop_path : data.still_path;
          setImage(imgPath ? `https://image.tmdb.org/t/p/w500${imgPath}` : null);
        }
      } catch (e) {}
    }
    if (item.item_id) fetchImage();
    return () => { active = false; };
  }, [item, isMovie]);

  const href = isMovie
    ? `/movies/${item.item_id}`
    : `/series/${item.item_id}?season=${item.season || 1}&episode=${item.episode || 1}`;

  const displayTitle = item.item_type === 'series' 
    ? `T${item.season} : E${item.episode}` 
    : "Continuar Filme";

  return (
    <Link
      href={href}
      className="flex-none w-[240px] group relative rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition hover:scale-105 bg-gray-900 select-none"
      draggable="false"
    >
      <div className="aspect-video relative bg-black">
        {image ? (
          <img src={image} alt="Progresso" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition pointer-events-none" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">🎬</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
           <div className="bg-red-600/90 rounded-full p-2 shadow-lg backdrop-blur-sm">
             <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
           </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
           <div className="h-full bg-red-600 w-[15%]"></div> 
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs text-red-400 font-bold uppercase tracking-wider mb-1">{displayTitle}</p>
        <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-white">{item.title || `Item #${item.item_id}`}</p>
      </div>
    </Link>
  );
}

export default function ContinueWatching({ items = [] }) {
  const rowRef = useRef(null);
  const { events, style } = useDraggableScroll(); // 👇

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-10 px-6 max-w-[1600px] mx-auto z-20 relative">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-white flex items-center gap-2">
        <span className="text-red-600">↺</span> Continuar a ver
      </h2>
      <div 
        ref={rowRef}
        {...events(rowRef)}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4" 
        style={{ ...style, WebkitOverflowScrolling: "touch" }}
      >
        {items.map((it) => (
          <ContinueCard key={`${it.item_type}-${it.item_id}-${it.season || 0}-${it.episode || 0}`} item={it} />
        ))}
      </div>
    </section>
  );
}