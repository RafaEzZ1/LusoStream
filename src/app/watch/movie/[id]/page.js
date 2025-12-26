import { getMovieEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";

export default async function WatchMoviePage({ params }) {
  const { id } = await params;
  const streamUrl = await getMovieEmbed(id);

  if (!streamUrl) return <div className="p-20 text-center text-white">Filme indisponível.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="relative w-full h-[50vh] md:h-[70vh] bg-black shadow-2xl">
        <iframe src={streamUrl} className="w-full h-full border-0" allowFullScreen allow="autoplay" />
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-purple-600">Assitir Filme</h1>
          <ReportButton mediaId={id} mediaTitle={`Filme ID: ${id}`} />
        </div>

        <PlayerControls mediaId={id} type="movie" backLink={`/movies/${id}`} />
      </div>

      <ProgressTracker mediaId={id} type="movie" duration={7200} />
    </div>
  );
}