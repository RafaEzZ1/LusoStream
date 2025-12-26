"use client";
import { useState } from "react";
import { FaServer, FaExclamationTriangle } from "react-icons/fa";

export default function VideoPlayer({ server1, server2 }) {
  const [activeServer, setActiveServer] = useState(1);

  // Fallback: se o servidor ativo não tiver link, usa o outro
  const videoUrl = activeServer === 1 ? server1 : (server2 || server1);

  if (!server1 && !server2) {
    return (
      <div className="aspect-video w-full bg-zinc-900/50 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600">
        <FaExclamationTriangle size={48} className="mb-4 text-zinc-800" />
        <p className="font-black uppercase tracking-widest text-xs italic">Conteúdo Indisponível</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveServer(1)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
            activeServer === 1 
            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 scale-105" 
            : "bg-zinc-900/80 text-zinc-500 border border-white/5 hover:bg-zinc-800"
          }`}
        >
          <FaServer size={12} /> SERVIDOR 1
        </button>

        {server2 && (
          <button
            onClick={() => setActiveServer(2)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all ${
              activeServer === 2 
              ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40 scale-105" 
              : "bg-zinc-900/80 text-zinc-500 border border-white/5 hover:bg-zinc-800"
            }`}
          >
            <FaServer size={12} /> SERVIDOR 2
          </button>
        )}
      </div>

      <div className="relative aspect-video w-full bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <iframe
          src={videoUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          scrolling="no"
          frameBorder="0"
        />
      </div>
    </div>
  );
}