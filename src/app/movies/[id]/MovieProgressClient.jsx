"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getVideoProgress } from "@/lib/progress";

export default function MovieProgressClient({ mediaId }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !mediaId) {
      setLoading(false);
      return;
    }

    async function load() {
      // Usa a função do Firebase que criámos
      const time = await getVideoProgress(user.uid, mediaId);
      setProgress(time);
      setLoading(false);
    }

    load();
  }, [user, mediaId]);

  if (loading || progress < 10) return null; // Só mostra se tiver visto mais de 10 segundos

  return (
    <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-bold">Continuar a ver</p>
        <p className="text-gray-400 text-xs">Paraste aos {Math.floor(progress / 60)} minutos</p>
      </div>
      <button 
        onClick={() => {
            // Encontra o player e salta para o tempo (lógica simples)
            const video = document.querySelector('video');
            if(video) video.currentTime = progress;
        }}
        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-4 py-2 rounded-full font-bold transition"
      >
        Retomar
      </button>
    </div>
  );
}