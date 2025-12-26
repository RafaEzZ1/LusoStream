import { getMovieEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getMovieData(id) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
    return await res.json();
  } catch (e) { return null; }
}

export default async function WatchMoviePage({ params }) {
  const { id } = await params;
  
  const [streamUrl, movieData] = await Promise.all([
    getMovieEmbed(id),
    getMovieData(id)
  ]);

  if (!streamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center">
        <p className="text-xl mb-4">Filme indisponível no momento.</p>
        <Link href={`/movies/${id}`} className="bg-purple-600 px-6 py-2 rounded-lg font-bold">Voltar</Link>
      </div>
    );
  }

  const duration = (movieData?.runtime || 120) * 60;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Player com aspect-video para garantir que cabe no ecrã do iPhone sem scroll estranho */}
      <div className="relative w-full aspect-video bg-black shadow-2xl">
        <iframe 
          src={streamUrl} 
          className="w-full h-full border-0" 
          allowFullScreen 
          allow="autoplay"
        />
      </div>

      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-bold">{movieData?.title}</h1>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">{movieData?.release_date?.split('-')[0]} • Filme</p>
        </div>

        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
          <PlayerControls 
            mediaId={id} 
            type="movie"
            backLink={`/movies/${id}`}
          />
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
          <ReportButton mediaId={id} mediaTitle={movieData?.title || id} />
          <p className="text-xs text-zinc-600">Duração: {movieData?.runtime} min</p>
        </div>
      </div>

      <ProgressTracker mediaId={id} type="movie" duration={duration} />
    </div>
  );
}