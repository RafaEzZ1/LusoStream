// src/app/movies/[id]/MovieProgressClient.jsx
"use client";

import { useEffect } from "react";
import { touchMovieProgress } from "@/lib/progress";

export default function MovieProgressClient({ movieId, runtimeSeconds = null }) {
  useEffect(() => {
    if (!movieId) return;
    // marca como "in_progress" assim que o user abre o detalhe
    touchMovieProgress(movieId, {
      estimated_duration_seconds: runtimeSeconds,
      status: "in_progress",
    });
  }, [movieId, runtimeSeconds]);

  return null;
}
