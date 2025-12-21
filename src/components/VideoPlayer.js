"use client";
import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function VideoPlayer({ src, subtitles }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full max-w-3xl rounded-2xl border border-gray-700"
    >
      {subtitles && (
        <track
          kind="subtitles"
          label={subtitles.label}
          srcLang={subtitles.lang}
          src={subtitles.src}
          default
        />
      )}
    </video>
  );
}
