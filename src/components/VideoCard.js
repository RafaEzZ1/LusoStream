"use client";
import DubbingBadge from "./DubbingBadge"; // Importar o Badge

export default function VideoCard({ movie, onClick }) {
  return (
    <div
      className="relative group cursor-pointer min-w-[150px] transform transition-transform duration-300 hover:scale-105"
      onClick={onClick}
    >
      {/* Imagem */}
      <img
        src={movie.image}
        alt={movie.title || movie.name}
        className="rounded-lg w-full h-[225px] object-cover"
        loading="lazy"
      />

      {/* --- O BADGE AUTOMÁTICO (Modo Capa) --- */}
      {/* Passamos o ID e ele verifica sozinho se é dobrado */}
      <DubbingBadge tmdbId={movie.id || movie.tmdbId} type="card" />

      {/* Título no Hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white font-bold text-sm">{movie.title || movie.name}</h3>
      </div>
    </div>
  );
}