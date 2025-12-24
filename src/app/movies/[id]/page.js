"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; 
import { useAuth } from "@/components/AuthProvider";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const castRef = useRef(null);
  const { events: castEvents } = useDraggableScroll();

  useEffect(() => {
    if (!id) return;
    async function fetchMovie() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`);
        const data = await res.json();
        setMovie(data);
        const trailer = data.videos?.results?.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
        if (trailer) setTrailerKey(trailer.key);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchMovie();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      supabase.from("watchlists").select("id").eq("user_id", user.id).eq("item_id", id).eq("item_type", "movie").maybeSingle()
        .then(({ data }) => { if (data) setIsInList(true); });
    }
  }, [user, id]);

  async function toggleMyList() {
    if (!user) return router.push("/auth");
    setListLoading(true);
    if (isInList) {
      await supabase.from("watchlists").delete().eq("user_id", user.id).eq("item_id", movie.id).eq("item_type", "movie");
      setIsInList(false);
    } else {
      await supabase.from("watchlists").insert({ user_id: user.id, item_id: movie.id, item_type: "movie" });
      setIsInList(true);
    }
    setListLoading(false);
  }

  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-red-600 rounded-full animate-spin border-t-transparent shadow-lg shadow-red-900"></div></div>;
  if (!movie || !movie.title) return <div className="bg-black min-h-screen text-white flex items-center justify-center text-xl">Filme não encontrado.</div>;

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans pb-20 selection:bg-red-900 selection:text-white">
      <Navbar />
      
      <div className="relative w-full min-h-[90vh] flex items-center overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] group-hover:scale-110" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center pt-24">
          <div className="hidden md:block col-span-1 animate-in fade-in slide-in-from-left-8 duration-700">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full rounded-2xl shadow-2xl shadow-black/50 border border-white/10 hover:border-red-600/50 transition-all duration-500 transform hover:-translate-y-2 hover:rotate-1" />
          </div>

          <div className="col-span-1 md:col-span-2 space-y-8 animate-in slide-in-from-right-8 duration-700">
            <div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-xl mb-4">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300">
                <span className="text-green-400 border border-green-500/30 bg-green-500/10 px-3 py-1 rounded-md shadow-sm shadow-green-900/20">{Math.round(movie.vote_average * 10)}% Relevância</span>
                <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm">{movie.release_date?.split("-")[0]}</span>
                <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm">{movie.runtime} min</span>
                {movie.genres?.slice(0, 3).map(g => <span key={g.id} className="text-gray-400">• {g.name}</span>)}
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl drop-shadow-md">{movie.overview}</p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href={`/watch/movie/${movie.id}`} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-red-900/50 group">
                <svg className="w-7 h-7 fill-current group-hover:animate-pulse" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> <span className="text-lg">Assistir Agora</span>
              </Link>
              <button onClick={toggleMyList} disabled={listLoading} className={`font-bold py-4 px-8 rounded-full transition border flex items-center gap-2 ${isInList ? "bg-green-600 border-green-600 text-white" : "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"}`}>
                {listLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : isInList ? "✓ Na Lista" : "+ Minha Lista"}
              </button>
              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full transition border border-white/30 flex items-center gap-2 backdrop-blur-sm">Trailer</button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        {movie.credits?.cast?.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><span className="w-1.5 h-8 bg-red-600 rounded-full"></span> Elenco Principal</h2>
            <div ref={castRef} {...castEvents(castRef)} className="flex gap-6 overflow-x-auto pb-8 no-scrollbar cursor-grab active:cursor-grabbing p-1">
              {movie.credits.cast.slice(0, 15).map((actor) => (
                <div key={actor.id} className="flex-none w-40 group select-none relative bg-gray-900/50 rounded-xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <div className="w-full h-48 overflow-hidden">
                    <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w300${actor.profile_path}` : "/no-avatar.png"} alt={actor.name} onDragStart={(e) => e.preventDefault()} className="w-full h-full object-cover pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-white truncate">{actor.name}</p>
                    {actor.character && (
                      <p className="text-xs text-gray-400 mt-1 truncate italic">como {actor.character}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {movie.similar?.results?.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3"><span className="w-1.5 h-8 bg-red-600 rounded-full"></span> Recomendado para ti</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movie.similar.results.slice(0, 10).map((sim) => (
                <Link key={sim.id} href={`/movies/${sim.id}`} className="group block relative bg-gray-900 rounded-xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-red-900/20">
                  <div className="aspect-[2/3] w-full relative">
                    <img src={sim.poster_path ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` : "/no-image.jpg"} alt={sim.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{sim.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowTrailer(false)}>
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900/50">
               <span className="font-bold text-white flex items-center gap-2">🎬 Trailer Oficial</span>
               <button onClick={() => setShowTrailer(false)} className="bg-white/10 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
            </div>
            <div className="aspect-video bg-black"><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe></div>
          </div>
        </div>
      )}
    </div>
  );
}