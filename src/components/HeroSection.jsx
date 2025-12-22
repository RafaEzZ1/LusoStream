// src/components/HeroSection.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function HeroSection() {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    async function fetchHero() {
      try {
        // Buscar filmes em tendência hoje
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}&language=pt-BR`
        );
        const data = await res.json();
        // Escolher um aleatório dos top 5 para variar
        const random = data.results[Math.floor(Math.random() * 5)];
        setMovie(random);
      } catch (e) {
        console.error(e);
      }
    }
    fetchHero();
  }, []);

  if (!movie) return <div className="h-[70vh] bg-black animate-pulse" />;

  return (
    <div className="relative w-full h-[85vh] text-white mb-8">
      {/* Imagem de Fundo */}
      <div className="absolute inset-0">
        <img
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="w-full h-full object-cover opacity-60"
        />
        {/* Gradiente para o texto ser legível */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
      </div>

      {/* Conteúdo */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 pb-24 max-w-4xl z-10">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block shadow-lg">
          Destaque do Dia
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg leading-tight">
          {movie.title}
        </h1>
        <p className="text-gray-200 text-lg mb-6 line-clamp-3 md:line-clamp-2 max-w-2xl drop-shadow-md font-medium">
          {movie.overview}
        </p>

        <div className="flex gap-4">
          <Link
            href={`/movies/${movie.id}`}
            className="bg-white text-black px-8 py-3 rounded font-bold text-lg hover:bg-gray-200 transition flex items-center gap-2 shadow-lg shadow-white/10"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            Ver Agora
          </Link>
          <Link
            href={`/movies/${movie.id}`}
            className="bg-gray-600/80 text-white px-8 py-3 rounded font-bold text-lg hover:bg-gray-500 transition flex items-center gap-2 backdrop-blur-sm"
          >
            Mais Info
          </Link>
        </div>
      </div>
    </div>
  );
}