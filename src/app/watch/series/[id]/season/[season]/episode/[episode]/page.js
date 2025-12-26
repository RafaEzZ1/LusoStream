import { getEpisodeEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls"; // <--- Novo Componente

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

// Função para duração
async function getEpisodeDuration(id, season, episode) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season}/episode/${episode}?api_key=${API_KEY}`);
    const data = await res.json();
    return (data.runtime || 45) * 60;
  } catch (e) { return 2700; }
}

export default async function WatchEpisodePage({ params }) {
  const { id, season, episode } = await params;
  
  const [streamUrl, duration] = await Promise.all([
    getEpisodeEmbed(id, season, episode),
    getEpisodeDuration(id, season, episode)
  ]);

  if (!streamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-xl">Episódio indisponível.</p>
        <a href={`/series/${id}`} className="text-purple-400 hover:underline">Voltar à Série</a>
      </div>
    );
  }

  // Calcular Próximo Episódio (Simplesmente soma +1)
  const nextEpNum = Number(episode) + 1;
  const nextLink = `/watch/series/${id}/season/${season}/episode/${nextEpNum}`;

  return (
    <div className="w-full h-screen bg-black relative group">
      
      {/* BOTÕES DE CONTROLO (Voltar, Visto, Próximo) */}
      <PlayerControls 
        mediaId={id} 
        type="tv" 
        season={season} 
        episode={episode}
        backLink={`/series/${id}`}
        nextEpisodeLink={nextLink} 
      />

      {/* RASTREADOR DE TEMPO */}
      <ProgressTracker 
        mediaId={id} 
        type="tv" 
        season={season} 
        episode={episode} 
        duration={duration} 
      />

      <iframe 
        src={streamUrl} 
        className="w-full h-full border-0" 
        allowFullScreen 
        allow="autoplay"
      />
    </div>
  );
}