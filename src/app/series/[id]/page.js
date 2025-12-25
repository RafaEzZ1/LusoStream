import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaCalendar, FaYoutube } from 'react-icons/fa';
import DraggableScroll from "@/components/DraggableScroll";
import TrailerButton from "@/components/TrailerButton";

// Chave API
const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getData(id, seasonNumber) {
  const baseUrl = 'https://api.themoviedb.org/3';
  const language = 'pt-BR'; 

  try {
    const seriesReq = fetch(`${baseUrl}/tv/${id}?api_key=${API_KEY}&language=${language}&append_to_response=videos,credits`);
    const seasonReq = fetch(`${baseUrl}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=${language}`);
    const recsReq = fetch(`${baseUrl}/tv/${id}/recommendations?api_key=${API_KEY}&language=${language}`);

    const [seriesRes, seasonRes, recsRes] = await Promise.all([seriesReq, seasonReq, recsReq]);

    if (!seriesRes.ok) return { series: null };

    const series = await seriesRes.json();
    const seasonData = await seasonRes.json();
    const recommendations = await recsRes.json();

    return { series, seasonData, recommendations: recommendations.results || [] };
  } catch (error) {
    console.error("Erro:", error);
    return { series: null };
  }
}

export default async function SeriesPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const currentSeason = sp.season ? Number(sp.season) : 1;

  const { series, seasonData, recommendations } = await getData(id, currentSeason);

  if (!series || series.success === false) {
    return <div className="min-h-screen flex items-center justify-center text-white">Série não encontrada.</div>;
  }

  const trailer = series.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

  return (
    <div className="min-h-screen pb-20 bg-black text-white">
      {/* Banner Principal */}
      <div className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
            alt={series.name}
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{series.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-zinc-300 mb-6">
            <span className="flex items-center text-yellow-400 font-bold gap-1">
              <FaStar /> {series.vote_average?.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <FaCalendar /> {series.first_air_date?.split('-')[0]}
            </span>
            <span className="bg-zinc-800 px-2 py-1 rounded text-xs uppercase">
              {series.genres?.map(g => g.name).slice(0, 2).join(', ')}
            </span>
          </div>
          <p className="max-w-3xl text-lg text-zinc-300 line-clamp-3 md:line-clamp-4 mb-6">
            {series.overview}
          </p>

           {trailer && <TrailerButton trailerKey={trailer.key} />}
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 mt-10">
        
        {/* Seletor de Temporadas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-purple-600 pl-3">Temporadas</h2>
          <DraggableScroll className="gap-2 pb-2">
            {series.seasons?.filter(s => s.season_number > 0).map((season) => (
              <Link 
                key={season.id} 
                href={`/series/${id}?season=${season.season_number}`}
                scroll={false} 
                draggable={false} // <--- CORREÇÃO AQUI (removemos a função)
                className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-colors select-none ${
                  currentSeason === season.season_number 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {season.name}
              </Link>
            ))}
          </DraggableScroll>
        </div>

        {/* Episódios */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-zinc-300">
            Episódios da {seasonData?.name || `Temporada ${currentSeason}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {seasonData?.episodes?.map((ep) => (
              <div key={ep.id} className="bg-zinc-900 rounded-lg overflow-hidden group hover:ring-2 hover:ring-purple-600 transition">
                <div className="relative aspect-video w-full bg-zinc-800">
                  {ep.still_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                      alt={ep.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600">Sem Imagem</div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 text-xs rounded">
                    {ep.runtime || '?'}m
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm truncate text-white w-full">{ep.episode_number}. {ep.name}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-3 mt-1">{ep.overview || "Sem descrição."}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Elenco Principal */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4 text-white">Elenco Principal</h3>
          <DraggableScroll className="gap-4 pb-4">
            {series.credits?.cast?.slice(0, 10).map(actor => (
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
                <p className="text-xs text-zinc-500 truncate">{actor.character}</p>
              </div>
            ))}
          </DraggableScroll>
        </div>

        {/* Recomendações */}
        {recommendations && recommendations.length > 0 && (
          <div className="pt-8 border-t border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-600 pl-3">Recomendado para ti</h2>
            <DraggableScroll className="gap-4 pb-4">
              {recommendations.map((rec) => (
                <Link 
                  key={rec.id} 
                  href={rec.media_type === 'tv' ? `/series/${rec.id}` : `/movies/${rec.id}`} 
                  draggable={false} // <--- CORREÇÃO AQUI
                  className="flex-none w-[160px] group select-none"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-2">
                    {rec.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`}
                        alt={rec.name || rec.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300 pointer-events-none"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs">Sem Capa</div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-300 truncate group-hover:text-purple-400 transition">
                    {rec.name || rec.title}
                  </p>
                </Link>
              ))}
            </DraggableScroll>
          </div>
        )}
      </div>
    </div>
  );
}