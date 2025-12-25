import { getMovieEmbed } from "@/lib/embeds";
import WatchlistButton from "@/components/WatchlistButton";
import MovieProgressClient from "./MovieProgressClient";
import Link from "next/link";
import Image from "next/image";
import DraggableScroll from "@/components/DraggableScroll";
import TrailerButton from "@/components/TrailerButton";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getMovieData(id) {
  try {
    const baseUrl = 'https://api.themoviedb.org/3';
    const language = 'pt-BR';

    const movieReq = fetch(
      `${baseUrl}/movie/${id}?api_key=${API_KEY}&language=${language}&append_to_response=credits,videos`,
      { next: { revalidate: 3600 } }
    );
    const recsReq = fetch(
      `${baseUrl}/movie/${id}/recommendations?api_key=${API_KEY}&language=${language}&page=1`
    );

    const [movieRes, recsRes] = await Promise.all([movieReq, recsReq]);

    if (!movieRes.ok) return { movie: null, recommendations: [] };

    const movie = await movieRes.json();
    const recsData = await recsRes.json();

    return { movie, recommendations: recsData.results || [] };
  } catch (error) {
    console.error("Erro ao carregar filme:", error);
    return { movie: null, recommendations: [] };
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { movie } = await getMovieData(id);
  return {
    title: movie ? `${movie.title} - LusoStream` : "Filme não encontrado",
    description: movie?.overview || "Ver filmes online no LusoStream",
  };
}

export default async function MoviePage({ params }) {
  const { id } = await params;
  const { movie, recommendations } = await getMovieData(id);

  if (!movie) {
    return <div className="min-h-screen flex items-center justify-center text-white">Filme não encontrado (ID: {id}).</div>;
  }

  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;
  const director = movie.credits?.crew?.find(c => c.job === "Director")?.name;
  const trailer = movie.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 text-white">
      <div className="relative h-[70vh] w-full">
        <div className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-xl">{movie.title}</h1>
          
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
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Ver Filme
            </Link>

            {trailer && <TrailerButton trailerKey={trailer.key} />}
            <WatchlistButton mediaId={movie.id} mediaType="movie" />
          </div>

          <div className="mt-8 max-w-md">
             <MovieProgressClient mediaId={movie.id} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Sinopse</h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-8">{movie.overview}</p>
          
          {/* Elenco */}
          <h3 className="text-xl font-bold mb-4">Elenco Principal</h3>
          <DraggableScroll className="gap-4 pb-4">
            {movie.credits?.cast?.slice(0, 10).map(actor => (
              <div key={actor.id} className="flex-shrink-0 w-32 text-center select-none">
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-2 border border-white/10 relative">
                  {actor.profile_path ? (
                    <Image 
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} 
                      alt={actor.name}
                      fill
                      className="object-cover pointer-events-none" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
                <p className="text-sm font-bold truncate">{actor.name}</p>
                <p className="text-xs text-gray-500 truncate">{actor.character}</p>
              </div>
            ))}
          </DraggableScroll>
          
          {/* Recomendações */}
          {recommendations.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-xl font-bold mb-4 border-l-4 border-purple-500 pl-3">
                Também poderás gostar
              </h3>
              
              <DraggableScroll className="gap-4 pb-6">
                {recommendations.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/movies/${item.id}`}
                    draggable={false} // <--- CORREÇÃO AQUI
                    className="flex-shrink-0 w-40 group relative rounded-lg overflow-hidden bg-gray-800 select-none"
                  >
                    <div className="relative aspect-[2/3] w-full">
                      {item.poster_path ? (
                        <Image 
                          src={`https://image.tmdb.org/t/p/w342${item.poster_path}`} 
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-500 pointer-events-none" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">Sem Capa</div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-center p-2">
                        <span className="text-xs font-bold text-white">{item.title}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </DraggableScroll>
            </div>
          )}
        </div>

        <div className="bg-white/5 p-6 rounded-xl h-fit border border-white/10">
          <p className="text-gray-400 text-sm mb-1">Realizador</p>
          <p className="font-medium mb-4">{director || "N/A"}</p>
          <p className="text-gray-400 text-sm mb-1">Orçamento</p>
          <p className="font-medium mb-4">
            {movie.budget > 0 ? `$${(movie.budget / 1000000).toFixed(1)}M` : "N/A"}
          </p>
          <p className="text-gray-400 text-sm mb-1">Estúdio</p>
          <p className="font-medium">{movie.production_companies?.[0]?.name || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}