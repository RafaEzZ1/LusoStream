"use client";

import {
  AlertTriangle,
  Captions,
  CheckCircle2,
  Loader2,
  Maximize2,
  PlayCircle,
  RefreshCcw,
  Server,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type PlayerType = "movie" | "series";

type AdvancedVideoPlayerProps = {
  imdbId?: string;
  tmdbId?: string | number;
  title?: string;
  type?: PlayerType;
  season?: string | number;
  episode?: string | number;
};

type EmbedServer = {
  id: string;
  name: string;
  description: string;
  buildUrl: (props: Required<Pick<AdvancedVideoPlayerProps, "type">> &
    AdvancedVideoPlayerProps) => string | null;
};

const SERVERS: EmbedServer[] = [
  {
    id: "videasy",
    name: "Videasy",
    description: "Principal",
    buildUrl: ({ tmdbId, type, season, episode }) => {
      if (!tmdbId) return null;
      const base = "https://player.videasy.net";

      if (type === "series") {
        if (!season || !episode) return null;
        return `${base}/tv/${tmdbId}/${season}/${episode}?color=8B5CF6&nextEpisode=true&episodeSelector=true`;
      }

      return `${base}/movie/${tmdbId}?color=8B5CF6&overlay=true`;
    },
  },
  {
    id: "vidsrc",
    name: "vidsrc.to",
    description: "Fallback",
    buildUrl: ({ imdbId }) => {
      if (!imdbId) return null;
      return `https://vidsrc.to/embed/${imdbId}`;
    },
  },
  {
    id: "2embed",
    name: "2embed",
    description: "Reserva",
    buildUrl: ({ imdbId, type, season, episode }) => {
      if (!imdbId) return null;

      if (type === "series" && season && episode) {
        return `https://www.2embed.to/embed/imdb/tv?id=${imdbId}&s=${season}&e=${episode}`;
      }

      return `https://www.2embed.to/embed/imdb/movie?id=${imdbId}`;
    },
  },
];

export default function AdvancedVideoPlayer({
  imdbId,
  tmdbId,
  title = "LusoStream Player",
  type = "movie",
  season,
  episode,
}: AdvancedVideoPlayerProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [serverIndex, setServerIndex] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("A preparar o player...");
  const [failedServers, setFailedServers] = useState<string[]>([]);

  const servers = useMemo(() => SERVERS, []);
  const currentServer = servers[serverIndex] || servers[0];
  const sourceUrl = currentServer.buildUrl({
    imdbId,
    tmdbId,
    title,
    type,
    season,
    episode,
  });
  const label = type === "series" ? "Série" : "Filme";

  const goToServer = (index: number) => {
    const nextServer = servers[index];
    if (!nextServer) return;

    setServerIndex(index);
    setStatus("loading");
    setMessage(`A carregar ${nextServer.name}...`);
  };

  const tryNextServer = () => {
    const currentFailed = currentServer.id;
    const nextFailedServers = failedServers.includes(currentFailed)
      ? failedServers
      : [...failedServers, currentFailed];

    setFailedServers(nextFailedServers);

    const nextIndex = servers.findIndex((server, index) => {
      if (index <= serverIndex) return false;
      if (nextFailedServers.includes(server.id)) return false;
      return Boolean(
        server.buildUrl({ imdbId, tmdbId, title, type, season, episode })
      );
    });

    if (nextIndex >= 0) {
      goToServer(nextIndex);
      return;
    }

    setStatus("error");
    setMessage("Nenhum servidor disponível conseguiu carregar.");
  };

  const openFullscreen = async () => {
    const target = shellRef.current;
    if (!target) return;

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
        return;
      }

      const legacyTarget = target as HTMLDivElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
        mozRequestFullScreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
      };

      await (
        legacyTarget.webkitRequestFullscreen?.() ||
        legacyTarget.mozRequestFullScreen?.() ||
        legacyTarget.msRequestFullscreen?.()
      );
    } catch {
      setMessage("Fullscreen bloqueado pelo browser. Usa o botão interno do player.");
    }
  };

  useEffect(() => {
    if (!sourceUrl) {
      setStatus("error");
      setMessage(
        currentServer.id === "videasy"
          ? "Videasy precisa do TMDB ID. A tentar fallback..."
          : "Este servidor não tem ID suficiente para carregar."
      );

      const timeout = window.setTimeout(tryNextServer, 500);
      return () => window.clearTimeout(timeout);
    }

    setStatus("loading");
    setMessage(`A carregar ${currentServer.name}...`);
  }, [currentServer.id, sourceUrl]);

  const hasAnyPlayableId = Boolean(tmdbId || imdbId);

  if (!hasAnyPlayableId) {
    return (
      <section className="w-full rounded-3xl border border-white/10 bg-zinc-950 p-6 text-white shadow-2xl">
        <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-black/60 p-8 text-center">
          <AlertTriangle className="text-yellow-400" size={42} />
          <div>
            <h2 className="text-2xl font-black">Player indisponível</h2>
            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Falta IMDb ID/TMDB ID para carregar Videasy ou os fallbacks.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full space-y-5 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-400">
            {label}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-zinc-400">
            {status === "loading" ? (
              <Loader2 size={16} className="animate-spin text-purple-400" />
            ) : status === "ready" ? (
              <CheckCircle2 size={16} className="text-green-400" />
            ) : status === "error" ? (
              <AlertTriangle size={16} className="text-yellow-400" />
            ) : (
              <PlayCircle size={16} className="text-purple-400" />
            )}
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={openFullscreen}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest transition hover:border-purple-500/50 hover:bg-purple-600/20 active:scale-95"
        >
          <Maximize2 size={16} />
          Fullscreen
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-3 shadow-2xl shadow-purple-950/30">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {servers.map((server, index) => {
            const active = index === serverIndex;
            const failed = failedServers.includes(server.id);
            const disabled = !server.buildUrl({
              imdbId,
              tmdbId,
              title,
              type,
              season,
              episode,
            });

            return (
              <button
                key={server.id}
                type="button"
                onClick={() => goToServer(index)}
                disabled={disabled}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "border-purple-500 bg-purple-600 text-white"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                } ${failed && !active ? "border-yellow-500/30 text-yellow-300" : ""}`}
              >
                <Server size={14} />
                {server.name}
                <span className="hidden text-[9px] font-bold text-white/50 sm:inline">
                  {server.description}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={tryNextServer}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-xs font-black uppercase tracking-widest text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            <RefreshCcw size={14} />
            Próximo
          </button>
        </div>

        <div
          ref={shellRef}
          className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black fullscreen:aspect-auto fullscreen:h-screen fullscreen:w-screen fullscreen:rounded-none fullscreen:border-0"
        >
          {status === "loading" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-950">
              <Loader2 size={42} className="animate-spin text-purple-500" />
              <p className="text-sm font-bold text-zinc-400">{message}</p>
            </div>
          )}

          {sourceUrl && (
            <iframe
              ref={iframeRef}
              key={`${currentServer.id}-${sourceUrl}`}
              src={sourceUrl}
              title={`${title} - ${currentServer.name}`}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              referrerPolicy="origin"
              onLoad={() => {
                setStatus("ready");
                setMessage(
                  `${currentServer.name} carregado. Legendas PT-BR/PT-PT quando disponíveis no servidor.`
                );
              }}
              onError={() => {
                setStatus("error");
                setMessage(
                  `${currentServer.name} falhou. Podes trocar de servidor manualmente.`
                );
              }}
            />
          )}

          {status === "error" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-zinc-950/95 p-8 text-center">
              <AlertTriangle size={44} className="text-yellow-400" />
              <div>
                <h2 className="text-2xl font-black">Não foi possível carregar</h2>
                <p className="mt-2 max-w-lg text-sm text-zinc-400">
                  Videasy e os fallbacks disponíveis falharam ou não têm IDs
                  suficientes. Tenta trocar de servidor manualmente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFailedServers([]);
                  goToServer(0);
                }}
                className="rounded-2xl bg-purple-600 px-5 py-3 text-xs font-black uppercase tracking-widest transition hover:bg-purple-500 active:scale-95"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
          <Captions size={18} className="mt-0.5 shrink-0 text-purple-400" />
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-300">
              Legendas PT-BR / PT-PT
            </p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              O Videasy disponibiliza legendas quando existirem para o título.
              Nos fallbacks, a seleção de legendas fica dentro do player de cada
              servidor.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
