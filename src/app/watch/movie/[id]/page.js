import { getMovieEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls"; // <--- Novo Componente

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

async function getMovieDuration(id) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    return (data.runtime || 120) * 60;
  } catch (e) { return 7200; }
}

export default async function WatchMoviePage({ params }) {
  const { id } = await params;
  
  const [streamUrl, duration] = await Promise.all([
    getMovieEmbed(id),
    getMovieDuration(id)
  ]);

  if (!streamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-xl">Filme indisponível.</p>
        <a href={`/movies/${id}`} className="text-purple-400 hover:underline">Voltar aos Detalhes</a>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative group">
      
      {/* BOTÕES DE CONTROLO (Voltar, Visto) */}
      <PlayerControls 
        mediaId={id} 
        type="movie"
        backLink={`/movies/${id}`}
      />

      <ProgressTracker mediaId={id} type="movie" duration={duration} />

      <iframe 
        src={streamUrl} 
        className="w-full h-full border-0" 
        allowFullScreen 
        allow="autoplay"
      />
    </div>
  );
}