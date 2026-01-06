"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import DubbingBadge from "@/components/DubbingBadge"; // <--- 1. Importar

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

const GENRES = [
  { id: null, name: "Todas" }, { id: "anime", name: "🇯🇵 Animes" }, { id: 10759, name: "Ação & Aventura" }, { id: 16, name: "Animação (Geral)" }, { id: 35, name: "Comédia" },
  { id: 80, name: "Crime" }, { id: 18, name: "Drama" }, { id: 10751, name: "Família" }, { id: 9648, name: "Mistério" }, { id: 10765, name: "Sci-Fi & Fantasia" },
  { id: 37, name: "Western" }, { id: 10768, name: "Guerra & Política" },
];

export default function SeriesPage() {
  const [series, setSeries] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const scrollRef = useRef(null); 
  const { events } = useDraggableScroll();

  useEffect(() => { setSeries([]); setPage(1); fetchSeries(1, selectedGenre); }, [selectedGenre]);

  async function fetchSeries(pageNum, genreId) {
    setLoading(true);
    try {
      let url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=pt-BR&sort_by=popularity.desc&page=${pageNum}`;
      if (genreId === "anime") url += `&with_genres=16&with_original_language=ja`;
      else if (genreId) url += `&with_genres=${genreId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (pageNum === 1) setSeries(data.results);
      else setSeries((prev) => [...prev, ...data.results]);
    } catch (error) { console.error("Erro ao buscar séries:", error); }
    setLoading(false);
  }

  function handleLoadMore() { const nextPage = page + 1; setPage(nextPage); fetchSeries(nextPage, selectedGenre); }

  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <main className="pt-24 px-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 border-l-4 border-blue-600 pl-4">Séries & Animes</h1>
          <div ref={scrollRef} {...events(scrollRef)} className="flex gap-3 overflow-x-auto pb-4 no-scrollbar cursor-grab active:cursor-grabbing">
            {GENRES.map((genre) => (
              <button key={genre.name} onClick={() => setSelectedGenre(genre.id)} className={`flex-none whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition duration-300 border select-none ${selectedGenre === genre.id ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white"}`}>{genre.name}</button>
            ))}
          </div>
        </div>

        {series.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in duration-700">
            {series.map((show) => (
              <Link key={`${show.id}-${show.vote_count}`} href={`/series/${show.id}`} className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-blue-500 transition hover:scale-105 hover:z-10">
                <div className="aspect-[2/3] w-full relative">
                  <img src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : "/no-image.jpg"} alt={show.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition pointer-events-none" loading="lazy" />
                  <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">★ {show.vote_average?.toFixed(1)}</div>
                  
                  {/* --- 2. O SELO ENTRA AQUI --- */}
                  <DubbingBadge tmdbId={show.id} type="card" />

                </div>
                <div className="p-3">
                  <h2 className="font-bold text-sm truncate text-gray-200 group-hover:text-white">{show.name}</h2>
                  <p className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>{show.original_language === 'ja' && show.genre_ids?.includes(16) ? "ANIME" : (show.first_air_date?.split("-")[0] || "N/A")}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (<div className="text-center py-20 text-gray-500">{loading ? "A procurar..." : "Nada encontrado."}</div>)}

        {series.length > 0 && (<div className="mt-12 text-center"><button onClick={handleLoadMore} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition transform hover:scale-105 disabled:opacity-50 shadow-lg">{loading ? "A carregar..." : "Carregar Mais"}</button></div>)}
      </main>
    </div>
  );
}