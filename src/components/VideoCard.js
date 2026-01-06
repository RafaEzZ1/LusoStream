"use client";
import Link from "next/link";
import DubbingBadge from "./DubbingBadge"; // O nosso detetive

export default function VideoCard({ movie }) {
  // Define o link correto (filme ou série)
  const linkUrl = movie.media_type === "tv" || movie.name ? `/series/${movie.id}` : `/movies/${movie.id}`;
  
  // Título (filmes usam .title, séries usam .name)
  const title = movie.title || movie.name;
  
  // Data (filmes usam release_date, séries usam first_air_date)
  const date = movie.release_date || movie.first_air_date;
  const year = date ? date.split("-")[0] : "N/A";

  return (
    <Link 
      href={linkUrl} 
      className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-gray-500 transition hover:scale-105 hover:z-10 block"
    >
      <div className="aspect-[2/3] w-full relative">
        {movie.poster_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={title} 
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">Sem Capa</div>
        )}

        {/* --- SELO DE DOBRAGEM (NOVO) --- */}
        <DubbingBadge tmdbId={movie.id} type="card" />

        {/* --- ESTRELA DE CLASSIFICAÇÃO (MANTIDA) --- */}
        <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm shadow-md">
           ★ {movie.vote_average?.toFixed(1)}
        </div>
      </div>
      
      <div className="p-3">
        <h2 className="font-bold text-sm truncate text-gray-200 group-hover:text-white">{title}</h2>
        <p className="text-xs text-gray-500 mt-1 flex justify-between">
          <span>{year}</span>
          {/* Se for Anime, mostra a tag (lógica extraída do teu código) */}
          {movie.original_language === 'ja' && movie.genre_ids?.includes(16) && (
             <span className="text-[9px] bg-red-600 text-white px-1 rounded">ANIME</span>
          )}
        </p>
      </div>
    </Link>
  );
}