// src/components/ContinueWatching.jsx
"use client";

import Link from "next/link";

export default function ContinueWatching({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-3 px-2 md:px-0">
        Continuar a ver
      </h2>
      <div
        className="
          flex gap-3 overflow-x-auto no-scrollbar scroll-smooth
          pb-3
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((it) => {
          const isMovie = it.item_type === "movie";
          const href = isMovie
            ? `/movies/${it.item_id}`
            : `/series/${it.item_id}?season=${it.season || 1}&episode=${it.episode || 1}`;

          return (
            <Link
              key={`${it.item_type}-${it.item_id}-${it.season || 0}-${it.episode || 0}`}
              href={href}
              className="flex-none w-[150px] md:w-[180px] bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 hover:border-red-600 transition"
            >
              <div className="h-[210px] bg-gradient-to-b from-gray-800 to-black flex items-center justify-center text-gray-500 text-xs">
                {isMovie ? "Filme" : `T${it.season}E${it.episode}`}
              </div>
              <div className="p-2">
                <p className="text-sm font-semibold line-clamp-2">
                  {it.title || (isMovie ? "Filme" : "Série")}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Último acesso:{" "}
                  {it.last_seen_at
                    ? new Date(it.last_seen_at).toLocaleString()
                    : "agora"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
