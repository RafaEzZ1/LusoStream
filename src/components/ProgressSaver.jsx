"use client";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveVideoProgress } from "@/lib/progress";

export default function ProgressSaver({ mediaId, currentTime, duration }) {
  const { user } = useAuth();

  useEffect(() => {
    // Só guarda se tivermos utilizador e o vídeo estiver a andar
    if (!user || !mediaId || currentTime <= 5) return;

    // Grava a cada 5 segundos ou quando o componente desmontar
    const timeout = setTimeout(() => {
      saveVideoProgress(user.uid, mediaId, currentTime, duration);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [user, mediaId, currentTime, duration]);

  return null; // Componente invisível
}