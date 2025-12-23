// src/app/movies/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false); // Estado do Modal do Trailer

  useEffect(() => {
    if (id) fetchMovieDetails();
  }, [id]);

  async function fetchMovieDetails() {
    try {
      // O "append_to_response" faz a magia: busca Créditos, Vídeos e Similares num só pedido!
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`
      );
      const data = await res.json();
      setMovie(data);
    } catch (error) {
      console.error("Erro ao carregar filme:", error);
    }
    setLoading(false);
  }

  // Encontrar o Trailer do YouTube nos resultados
  const trailer = movie?.videos?.results?.find(
    (vid) => vid.site === "YouTube" && (vid.type === "Trailer" || vid.type === "Teaser")
  );

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) return <div className="text-white text-center pt-40">Filme não encontrado.</div>;

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans">
      <Navbar />

      {/* 1. HERO SECTION (Imagem de Fundo) */}
      <div 
        className="relative w-full h-[50vh] md:h-[70vh] bg-cover bg-center"
        style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
          {/* Poster */}
          <img 
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
            alt={movie.title} 
            className="hidden md:block w-48 rounded-lg shadow-2xl shadow-black/50 border border-gray-800"
          />
          
          {/* Texto Principal */}
          <div className="mb-4 w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
              <span className="text-green-400 font-bold">{Math.round(movie.vote_average * 10)}% Relevância</span>
              <span>{movie.release_date?.split("-")[0]}</span>
              <span className="border border-gray-600 px-2 py-0.5 rounded text-xs">
                {movie.adult ? "+18" : "Livre"}
              </span>
              <span>{movie.runtime} min</span>
              {trailer && (
                <button 
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 text-white hover:text-red-500 transition font-bold uppercase tracking-wider text-xs border border-white/20 hover:border-red-500 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Ver Trailer
                </button>
              )}
            </div>
            
            <p className="max-w-3xl text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* 2. ÁREA DO PLAYER (Importante!) */}
        <div className="mb-16">
           <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-red-600 pl-3">Assistir Agora</h2>
           <div className="w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl relative group">
              {/* AQUI ENTRA O TEU IFRAME / PLAYER REAL */}
              {/* Exemplo de placeholder (Remove isto e mete o teu iframe): */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                 <p className="mb-4">Player Principal (UpStream / MixDrop)</p>
                 <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/50">
                    ▶ Play Filme
                 </button>
              </div>
           </div>
        </div>

        {/* 3. ELENCO (CAST) */}
        {movie.credits?.cast?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Elenco Principal</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {movie.credits.cast.slice(0, 10).map((actor) => (
                <div key={actor.id} className="flex-none w-32 text-center">
                  <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-800">
                    <img 
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/no-avatar.png"} 
                      alt={actor.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-bold text-white truncate">{actor.name}</p>
                  <p className="text-xs text-gray-500 truncate">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FILMES RELACIONADOS (SIMILAR) */}
        {movie.similar?.results?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Podes Gostar Também</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movie.similar.results.slice(0, 10).map((sim) => (
                <Link key={sim.id} href={`/movies/${sim.id}`} className="group block">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-800">
                    <img 
                      src={sim.poster_path ? `https://image.tmdb.org/t/p/w300${sim.poster_path}` : "/no-image.jpg"} 
                      alt={sim.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-400 group-hover:text-white truncate transition">
                    {sim.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. MODAL DO TRAILER */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <button 
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 text-white hover:text-red-500 z-10 bg-black/50 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`} 
                title="Trailer" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}