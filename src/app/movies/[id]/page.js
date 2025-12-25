import { getMovieEmbed } from "@/lib/embeds";
import WatchlistButton from "@/components/WatchlistButton";
import MovieProgressClient from "./MovieProgressClient";
import Recommendations from "@/components/Recommendations";
import DraggableScroll from "@/components/DraggableScroll"; // <--- NOVO IMPORT
import Link from "next/link";
import { FaPlay, FaYoutube } from "react-icons/fa"; // <--- ÍCONES NOVOS

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getMovie(id) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const movie = await getMovie(id);
  return {
    title: movie ? `${movie.title} - LusoStream` : "Filme não encontrado",
    description: movie?.overview || "Ver filmes online no LusoStream",
  };
}

export default async function MoviePage({ params }) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-white">Filme não encontrado (ID: {id}).</div>;
  }

  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const director = movie.credits?.crew?.find(c => c.job === "Director")?.name;
  
  // Encontrar o trailer do YouTube
  const trailer = movie.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-xl">{movie.title}</h1>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6 items-center">
            <span className="text-green-400 font-bold">{movie.vote_average.toFixed(1)} Classificação</span>
            <span>{movie.release_date?.split("-")[0]}</span>
            <span>{hours}h {minutes}m</span>
            {movie.genres?.map(g => (
              <span key={g.id} className="border border-white/20 px-2 py-0.5 rounded text-xs">{g.name}</span>
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              href={`/watch/movie/${movie.id}`}
              className="bg-white text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition flex items-center gap-2 shadow-lg shadow-white/10"
            >
              <FaPlay /> Ver Filme
            </Link>

            {trailer && (
              <a 
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
              >
                <FaYoutube /> Trailer
              </a>
            )}

            <WatchlistButton mediaId={movie.id} mediaType="movie" />
          </div>
          <div className="mt-8 max-w-md">
             <MovieProgressClient mediaId={movie.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-white">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Sinopse</h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-8">{movie.overview}</p>
          
          <h3 className="text-xl font-bold mb-4">Elenco Principal</h3>
          
          {/* USANDO O NOVO COMPONENTE DE ARRASTAR */}
          <DraggableScroll className="gap-4 pb-4">
            {movie.credits?.cast?.slice(0, 10).map(actor => (
              <div key={actor.id} className="flex-shrink-0 w-32 text-center select-none">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-2 border border-white/10">
                  {actor.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} className="w-full h-full object-cover pointer-events-none" />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <p className="text-sm font-bold truncate">{actor.name}</p>
                <p className="text-xs text-gray-500 truncate">{actor.character}</p>
              </div>
            ))}
          </DraggableScroll>
          
          <Recommendations type="movie" id={movie.id} />
        </div>

        <div className="bg-white/5 p-6 rounded-xl h-fit border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Realizador</p>
          <p className="font-medium mb-4">{director || "N/A"}</p>
          <p className="text-gray-400 text-sm mb-1">Orçamento</p>
          <p className="font-medium mb-4">${(movie.budget / 1000000).toFixed(1)}M</p>
          <p className="text-gray-400 text-sm mb-1">Estúdio</p>
          <p className="font-medium">{movie.production_companies?.[0]?.name || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}