"use client";
import { useState } from "react";
import { FaYoutube, FaTimes } from "react-icons/fa";

export default function TrailerButton({ trailerKey }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trailerKey) return null;

  return (
    <>
      {/* O Botão Vermelho */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition flex items-center gap-2 shadow-lg"
      >
        <FaYoutube /> Trailer
      </button>

      {/* O Pop-up (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
            
            {/* Botão de Fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition"
            >
              <FaTimes size={24} />
            </button>

            {/* O Vídeo do YouTube */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}