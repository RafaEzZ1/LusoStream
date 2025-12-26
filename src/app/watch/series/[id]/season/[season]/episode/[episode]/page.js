import { getEpisodeEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";

export default async function WatchEpisodePage({ params }) {
  const { id, season, episode } = await params;
  const streamUrl = await getEpisodeEmbed(id, season, episode);

  if (!streamUrl) return <div className="p-20 text-center text-white">Episódio indisponível.</div>;

  const nextEp = Number(episode) + 1;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Player mais curto para UX Mobile */}
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-black shadow-2xl">
        <iframe src={streamUrl} className="w-full h-full border-0" allowFullScreen allow="autoplay" />
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-purple-500 font-bold text-xs uppercase tracking-widest">Série ID: {id}</span>
            <h1 className="text-xl font-black uppercase tracking-tight">T{season} • EP{episode}</h1>
          </div>
          <ReportButton mediaId={id} mediaTitle={`Série ${id} S${season}E${episode}`} />
        </div>

        {/* Botões Grandes para o polegar */}
        <PlayerControls 
          mediaId={id} type="tv" 
          season={season} episode={episode}
          backLink={`/series/${id}`}
          nextEpisodeLink={`/watch/series/${id}/season/${season}/episode/${nextEp}`}
        />
      </div>

      <ProgressTracker mediaId={id} type="tv" season={season} episode={episode} duration={2700} />
    </div>
  );
}