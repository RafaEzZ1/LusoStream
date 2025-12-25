// src/app/series/[id]/page.js
import WatchlistButton from "@/components/WatchlistButton";
import Link from "next/link";
import Recommendations from "@/components/Recommendations";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getSeries(id) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// Buscar episódios de uma temporada (por defeito T1)
async function getSeason(id, seasonNumber) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}&language=pt-BR`);
        return res.json();
    } catch(e) { return null; }
}

export async function generateMetadata({ params }) {
  const series = await getSeries(params.id);
  return {
    title: series ? `${series.name} - LusoStream` : "Série não encontrada",
  };
}

export default async function SeriesPage({ params }) {
  const series = await getSeries(params.id);
  // Por defeito mostra a temporada 1. Num mundo ideal, isto seria interativo com estado, 
  // mas para manter simples no Server Component, mostramos a T1.
  const season1 = await getSeason(params.id, 1);

  if (!series) return <div className="text-white">Série não encontrada.</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${series.backdrop_path}`}
            alt={series.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-7xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{series.name}</h1>
          <div className="flex gap-4 mb-6">
            <Link 
              href={`/watch/series/${series.id}/season/1/episode/1`}
              className="bg-white text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-200 transition"
            >
              Começar a Ver
            </Link>
            <WatchlistButton mediaId={series.id} mediaType="tv" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <p className="text-gray-300 text-lg mb-12 max-w-3xl">{series.overview}</p>

        {/* Lista de Episódios (Temporada 1) */}
        <h2 className="text-2xl font-bold text-white mb-6">Episódios (Temporada 1)</h2>
        <div className="space-y-4 max-w-4xl">
            {season1?.episodes?.map((ep) => (
                <Link 
                    key={ep.id} 
                    href={`/watch/series/${series.id}/season/1/episode/${ep.episode_number}`}
                    className="flex flex-col md:flex-row gap-4 bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition group"
                >
                    <div className="w-full md:w-48 aspect-video flex-shrink-0 rounded-lg overflow-hidden relative">
                         {ep.still_path ? (
                            <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                         ) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">Sem Imagem</div>
                         )}
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                         </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-white mb-1">{ep.episode_number}. {ep.name}</h3>
                            <span className="text-xs text-gray-400">{ep.air_date}</span>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{ep.overview}</p>
                    </div>
                </Link>
            ))}
        </div>

        <Recommendations type="tv" id={series.id} />
      </div>
    </div>
  );
}