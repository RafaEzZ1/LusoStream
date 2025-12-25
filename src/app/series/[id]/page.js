import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaCalendar, FaClock } from 'react-icons/fa'; // Certifica-te que tens o react-icons instalado

// Função para ir buscar os dados
async function getData(id, seasonNumber) {
  const apiKey = process.env.TMDB_API_KEY;
  const baseUrl = 'https://api.themoviedb.org/3';
  const language = 'pt-PT';

  // 1. Detalhes da Série (para saber quantas temporadas existem)
  const seriesReq = fetch(`${baseUrl}/tv/${id}?api_key=${apiKey}&language=${language}`);
  
  // 2. Episódios da Temporada selecionada
  const seasonReq = fetch(`${baseUrl}/tv/${id}/season/${seasonNumber}?api_key=${apiKey}&language=${language}`);
  
  // 3. Recomendações
  const recsReq = fetch(`${baseUrl}/tv/${id}/recommendations?api_key=${apiKey}&language=${language}`);

  // Fazemos os pedidos todos ao mesmo tempo para ser mais rápido
  const [seriesRes, seasonRes, recsRes] = await Promise.all([seriesReq, seasonReq, recsReq]);

  const series = await seriesRes.json();
  const seasonData = await seasonRes.json();
  const recommendations = await recsRes.json();

  return { series, seasonData, recommendations: recommendations.results || [] };
}

export default async function SeriesPage({ params, searchParams }) {
  // Em Next.js 15/16, params e searchParams são Promises e têm de levar await
  const { id } = await params;
  const sp = await searchParams;
  const currentSeason = sp.season ? Number(sp.season) : 1;

  const { series, seasonData, recommendations } = await getData(id, currentSeason);

  // Se der erro ou não encontrar
  if (!series || series.success === false) {
    return <div className="text-center mt-20 text-white">Série não encontrada.</div>;
  }

  return (
    <div className="min-h-screen pb-20 bg-black text-white">
      {/* --- BANNER PRINCIPAL --- */}
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
              <FaStar /> {Math.round(series.vote_average * 10) / 10}
            </span>
            <span className="flex items-center gap-1">
              <FaCalendar /> {series.first_air_date?.split('-')[0]}
            </span>
            <span className="flex items-center gap-1">
              <FaClock /> {series.episode_run_time?.[0]} min
            </span>
            <span className="bg-zinc-800 px-2 py-1 rounded text-xs uppercase">
              {series.genres?.map(g => g.name).slice(0, 2).join(', ')}
            </span>
          </div>

          <p className="max-w-3xl text-lg text-zinc-300 line-clamp-3 md:line-clamp-4">
            {series.overview}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 mt-10">
        
        {/* --- SELETOR DE TEMPORADAS --- */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-purple-600 pl-3">Temporadas</h2>
          <div className="flex flex-wrap gap-2">
            {series.seasons?.filter(s => s.season_number > 0).map((season) => (
              <Link 
                key={season.id} 
                href={`/series/${id}?season=${season.season_number}`}
                scroll={false} // Mantém a posição do scroll ao clicar
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentSeason === season.season_number 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {season.name}
              </Link>
            ))}
          </div>
        </div>

        {/* --- LISTA DE EPISÓDIOS --- */}
        <div className="mb-16">
          <h3 className="text-xl font-semibold mb-6 text-zinc-300">
            Episódios da {seasonData.name || `Temporada ${currentSeason}`}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {seasonData.episodes?.map((ep) => (
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
                    {ep.runtime}m
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm truncate text-white w-full" title={ep.name}>
                      {ep.episode_number}. {ep.name}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-3">
                    {ep.overview || "Sem descrição disponível."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- RECOMENDAÇÕES --- */}
        {recommendations.length > 0 && (
          <div className="pt-10 border-t border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-600 pl-3">Recomendado para ti</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 no-scrollbar">
              {recommendations.map((rec) => (
                <Link key={rec.id} href={rec.media_type === 'tv' ? `/series/${rec.id}` : `/filme/${rec.id}`} className="flex-none w-[160px] group">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800 mb-2">
                    {rec.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${rec.poster_path}`}
                        alt={rec.name || rec.title}
                        fill
                        className="object-cover group-hover:scale-110 transition duration-300"
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}