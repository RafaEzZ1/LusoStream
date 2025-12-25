import { getMovieEmbed } from "@/lib/embeds";
import ProgressTracker from "@/components/ProgressTracker";
import Link from "next/link";

export default async function WatchMoviePage({ params }) {
  const { id } = await params;
  
  // 1. Buscar o link do filme
  const streamUrl = await getMovieEmbed(id);

  // 2. Se não houver link, mostra mensagem de erro
  if (!streamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-xl">Filme indisponível no momento.</p>
        <Link href={`/movies/${id}`} className="text-purple-400 hover:underline">
          Voltar aos Detalhes
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative group">
      
      {/* Botão de Voltar (Aparece ao passar o rato no topo) */}
      <Link 
        href={`/movies/${id}`} 
        className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-purple-600 text-white px-4 py-2 rounded-lg backdrop-blur-md transition opacity-0 group-hover:opacity-100 duration-300"
      >
        ← Voltar
      </Link>

      {/* O CRONÓMETRO INVISÍVEL */}
      <ProgressTracker mediaId={id} type="movie" />

      {/* O PLAYER DE VÍDEO */}
      <iframe 
        src={streamUrl} 
        className="w-full h-full border-0" 
        allowFullScreen 
        allow="autoplay"
      />
    </div>
  );
}