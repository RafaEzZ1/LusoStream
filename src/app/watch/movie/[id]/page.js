"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import ProgressTracker from "@/components/ProgressTracker";
import PlayerControls from "@/components/PlayerControls";
import ReportButton from "@/components/ReportButton";
import VideoPlayer from "@/components/VideoPlayer"; // O novo player
import Navbar from "@/components/Navbar";

export default function WatchMoviePage() {
  const { id } = useParams();
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Precisamos buscar do Firebase porque é lá que guardaste o Server 1 e Server 2
  useEffect(() => {
    async function getMovie() {
      try {
        const q = query(collection(db, "content"), where("tmdbId", "==", id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setMovieData(snapshot.docs[0].data());
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    getMovie();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505]" />;
  
  // Se não houver dados no Firebase, mostramos aviso (ou podes usar o teu getMovieEmbed antigo como fallback)
  if (!movieData) return <div className="p-20 text-center text-white">Filme indisponível.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      {/* Container do Player */}
      <div className="relative w-full pt-20 md:pt-24 bg-black shadow-2xl px-4 md:px-0">
        <div className="max-w-7xl mx-auto">
             <VideoPlayer 
               server1={movieData.server1 || movieData.embedUrl} 
               server2={movieData.server2} 
             />
        </div>
      </div>

      <div className="p-5 md:p-10 max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black italic tracking-tighter uppercase underline decoration-purple-600">
            {movieData.title || "Assistir Filme"}
          </h1>
          <ReportButton mediaId={id} mediaTitle={`Filme ID: ${id}`} />
        </div>

        {/* Os teus controlos originais */}
        <PlayerControls mediaId={id} type="movie" backLink={`/movies/${id}`} />
      </div>

      {/* O teu tracker original */}
      <ProgressTracker mediaId={id} type="movie" duration={7200} />
    </div>
  );
}