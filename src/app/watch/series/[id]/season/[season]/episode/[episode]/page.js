import { getEpisodeEmbed } from "@/lib/embeds"; // Vai buscar o link ao Firebase
import ProgressTracker from "@/components/ProgressTracker"; // O tal cronómetro invisível
import Link from "next/link"; // Para o botão de voltar

export default async function WatchEpisodePage({ params }) {
  // 1. Receber os dados do URL
  const { id, season, episode } = await params;
  
  // 2. Ir buscar o link do vídeo
  const streamUrl = await getEpisodeEmbed(id, season, episode);

  // 3. Se não houver link, avisa
  if (!streamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
        <p className="text-xl">Episódio ainda indisponível.</p>
        <Link href={`/series/${id}`} className="text-purple-400 hover:underline">
          Voltar à Série
        </Link>
      </div>
    );
  }

  // 4. Se houver link, mostra o vídeo e liga o cronómetro
  return (
    <div className="w-full h-screen bg-black relative group">
      
      {/* Botão de Voltar (Aparece quando passas o rato) */}
      <Link 
        href={`/series/${id}`} 
        className="absolute top-4 left-4 z-20 bg-black/50 hover:bg-purple-600 text-white px-4 py-2 rounded-lg backdrop-blur-md transition opacity-0 group-hover:opacity-100 duration-300"
      >
        ← Voltar
      </Link>

      {/* O CRONÓMETRO INVISÍVEL ESTÁ AQUI A TRABALHAR */}
      <ProgressTracker 
        mediaId={id} 
        type="tv" 
        season={season} 
        episode={episode} 
      />

      {/* O VÍDEO */}
      <iframe 
        src={streamUrl} 
        className="w-full h-full border-0" 
        allowFullScreen 
        allow="autoplay"
      />
    </div>
  );
}