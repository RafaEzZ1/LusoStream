import { getEpisodeEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import Link from "next/link";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getEpisodeData(id, season, episode) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}/episode/${episode}?api_key=${API_KEY}&language=pt-BR`);
    return await res.json();
  } catch (e) { return null; }
}

export default async function WatchEpisodePage({ params }) {
  const { id, season, episode } = await params;
  
  const [streamUrl, epData] = await Promise.all([
    getEpisodeEmbed(id, season, episode),
    getEpisodeData(id, season, episode)
  ]);

  if (!streamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <p className="text-xl mb-4 text-center">Episódio ainda indisponível.</p>
        <Link href={`/series/${id}`} className="bg-purple-600 px-6 py-2 rounded-lg font-bold">Voltar</Link>
      </div>
    );
  }

  const duration = (epData?.runtime || 45) * 60;
  const nextEpNum = Number(episode) + 1;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Container do Player - Proporção Cinema */}
      <div className="relative w-full aspect-video bg-black shadow-2xl">
        <iframe 
          src={streamUrl} 
          className="w-full h-full border-0" 
          allowFullScreen 
          allow="autoplay"
        />
      </div>

      {/* Área de Controlos e Info - Otimizada para Mobile */}
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col gap-2">
          <h1 className="text-xl md:text-2xl font-bold truncate">
            {epData?.name || `Episódio ${episode}`}
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            Temporada {season} • Episódio {episode}
          </p>
        </div>

        {/* Botões de Ação - Tamanho ideal para toque no iPhone */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3">
          <PlayerControls 
            mediaId={id} 
            type="tv" 
            season={season} 
            episode={episode}
            backLink={`/series/${id}`}
            nextEpisodeLink={`/watch/series/${id}/season/${season}/episode/${nextEpNum}`}
          />
        </div>

        <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
          <ReportButton mediaId={id} mediaTitle={`${epData?.name || id} (S${season}E${episode})`} />
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">LusoStream Player</span>
        </div>

        {/* Sinopse Curta */}
        {epData?.overview && (
          <div className="bg-zinc-900/50 p-4 rounded-xl">
             <p className="text-sm text-zinc-400 leading-relaxed italic">"{epData.overview}"</p>
          </div>
        )}
      </div>

      <ProgressTracker mediaId={id} type="tv" season={season} episode={episode} duration={duration} />
    </div>
  );
}