"use client";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";
import { useRef } from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; 
// ^ Se não tiveres este hook, avisa-me que eu envio. 
// Se tiveres erros, remove a linha do hook e o {...events} abaixo.

export default function ContinueWatching({ items }) {
  const scrollRef = useRef(null);
  // Se não tiveres o useDraggableScroll, remove estas 3 linhas abaixo:
  let draggable = { events: () => ({}), style: {} };
  try { draggable = useDraggableScroll(); } catch(e) {}

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-l-4 border-purple-600 pl-3">
        Continuar a Ver
      </h2>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-4"
        style={{ ...draggable.style, cursor: 'grab' }}
        {...(draggable.events ? draggable.events(scrollRef) : {})}
      >
        {items.map((item) => {
          // Lógica do Link: Se for série, leva para o episódio exato.
          // Se for filme, leva para o player do filme.
          const isTv = item.mediaType === 'tv' || item.item_type === 'tv';
          
          let watchLink = "";
          if (isTv && item.season && item.episode) {
            watchLink = `/watch/series/${item.mediaId}/season/${item.season}/episode/${item.episode}`;
          } else if (isTv) {
            watchLink = `/series/${item.mediaId}`; // Fallback se não tiver temp/ep
          } else {
            watchLink = `/watch/movie/${item.mediaId}`;
          }

          return (
            <Link 
              key={`${item.mediaId}_${item.percentage}`}
              href={watchLink}
              className="flex-none w-[260px] md:w-[300px] group relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all hover:scale-105 hover:z-10 select-none"
            >
              {/* Imagem Widescreen (Backdrop) */}
              <div className="relative aspect-video w-full">
                <img 
                  src={item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500 pointer-events-none"
                />
                
                {/* Overlay Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/50">
                    <FaPlay className="text-white text-lg ml-1" />
                  </div>
                </div>

                {/* Tempo restante (Opcional) */}
                <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-gray-300">
                  {Math.floor((item.duration - item.seconds) / 60)}m restantes
                </div>
              </div>

              {/* Título e Info */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-200 truncate group-hover:text-white">
                  {item.title || item.name}
                </h3>
                {isTv && item.season && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    T{item.season}:E{item.episode}
                  </p>
                )}
                
                {/* BARRA DE PROGRESSO (Estilo Netflix) */}
                <div className="w-full bg-gray-700 h-1 mt-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}