"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Maximize2, PlayCircle } from "lucide-react";

type VideoPlayerProps = {
  imdbId?: string;
  title?: string;
  type?: "movie" | "series";
};

export default function VideoPlayer({
  imdbId,
  title = "LusoStream Player",
  type = "movie",
}: VideoPlayerProps) {
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  const embedUrl = imdbId ? `https://vidsrc.to/embed/${imdbId}` : "";
  const label = type === "series" ? "Série" : "Filme";

  const openFullscreen = async () => {
    try {
      await frameWrapRef.current?.requestFullscreen();
    } catch {
      // Some browsers block fullscreen until the user interacts with the iframe.
    }
  };

  if (!imdbId) {
    return (
      <section className="w-full space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">
            {label}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
            {title}
          </h1>
        </div>

        <div className="aspect-video w-full rounded-3xl border border-dashed border-white/10 bg-zinc-950 shadow-2xl shadow-black/60">
          <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full border border-yellow-500/20 bg-yellow-500/10 p-4 text-yellow-400">
              <AlertTriangle size={34} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Player indisponível
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                Não foi encontrado um IMDb ID para carregar o embed. Tenta
                novamente mais tarde.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">
            {label}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
            <PlayCircle size={16} className="text-purple-400" />
            Carregando player... Legendas automáticas PT-BR
          </p>
        </div>

        <button
          type="button"
          onClick={openFullscreen}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:border-purple-500/50 hover:bg-purple-600/20 active:scale-95"
        >
          <Maximize2 size={16} />
          Fullscreen
        </button>
      </div>

      <div
        ref={frameWrapRef}
        className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl shadow-purple-950/30 ring-1 ring-purple-500/10"
      >
        {!loaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-950">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
            <p className="text-sm font-bold text-zinc-400">
              Carregando player... Legendas automáticas PT-BR
            </p>
          </div>
        )}

        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          referrerPolicy="origin"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </section>
  );
}
