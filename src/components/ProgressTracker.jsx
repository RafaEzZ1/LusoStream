"use client";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { saveVideoProgress } from "@/lib/progress";

export default function ProgressTracker({ mediaId, type, season, episode, duration = 7200 }) {
  const { user } = useAuth();
  const timerRef = useRef(null);
  const secondsRef = useRef(0);

  useEffect(() => {
    // Se não houver user ou mediaId, não faz nada
    if (!user || !mediaId) return;

    const save = () => {
      secondsRef.current += 10; // Conta +10 segundos
      
      // Envia para o Firebase
      saveVideoProgress(
        user.uid, 
        mediaId, 
        secondsRef.current, 
        duration, 
        type, 
        season, 
        episode
      );
    };

    // Inicia o intervalo: Guarda a cada 10 segundos
    timerRef.current = setInterval(save, 10000);

    // Limpa o intervalo quando sais da página
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, mediaId, type, season, episode, duration]);

  // Este componente é invisível
  return null;
}