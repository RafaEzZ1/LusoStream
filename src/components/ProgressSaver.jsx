"use client";

import { useEffect, useRef } from "react";
import { setSeriesProgress } from "@/lib/progress";

/**
 * Props:
 * - id, title, season, episode
 * - getPosition: () => seconds
 * - getDuration: () => seconds
 */
export default function ProgressSaver({ id, title, season, episode, getPosition, getDuration }) {
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      try {
        const pos = typeof getPosition === "function" ? getPosition() : 0;
        const dur = typeof getDuration === "function" ? getDuration() : 0;
        setSeriesProgress(id, { title, season, episode, positionSeconds: Math.floor(pos), durationSeconds: Math.floor(dur) });
      } catch (e) {
        console.error(e);
      }
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [id, title, season, episode, getPosition, getDuration]);

  return null;
}
