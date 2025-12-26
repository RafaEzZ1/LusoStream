"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import ProgressSaver from "@/components/ProgressSaver";

export default function WatchMoviePage() {
  const { id } = useParams();
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getMovie() {
      try {
        const q = query(collection(db, "content"), where("tmdbId", "==", id));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setMovieData(snapshot.docs[0].data());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    getMovie();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <main className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        {movieData ? (
          <div className="space-y-8">
            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">
              {movieData.title}
            </h1>
            
            {/* Passamos os dois servidores para o Player */}
            <VideoPlayer 
              server1={movieData.server1 || movieData.embedUrl} 
              server2={movieData.server2} 
            />

            <ProgressSaver mediaId={id} mediaType="movie" />
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500 italic">
            Este filme ainda não está disponível nos nossos servidores.
          </div>
        )}
      </main>
    </div>
  );
}