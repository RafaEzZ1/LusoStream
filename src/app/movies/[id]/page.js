"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
// IMPORTANTE: Não importamos Navbar aqui (já está no layout)
import { useDraggableScroll } from "@/hooks/useDraggableScroll"; 
import { useAuth } from "@/components/AuthProvider"; // Usamos o hook global

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MovieDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // MUDANÇA CRÍTICA: Lemos o user diretamente do contexto global (instantâneo)
  // Em vez de o tentar buscar manualmente ao Supabase
  const { user, loading: authLoading } = useAuth(); 
  const supabase = createClient();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const castRef = useRef(null);
  const { events: castEvents } = useDraggableScroll();

  // 1. Fetch do Filme (Independente do Login)
  useEffect(() => {
    if (!id) return;
    async function fetchMovie() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits,videos,similar`);
        const data = await res.json();
        setMovie(data);
        const trailer = data.videos?.results?.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
        if (trailer) setTrailerKey(trailer.key);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchMovie();
  }, [id]);

  // 2. Verificar Lista (Só corre quando o user estiver garantidamente carregado)
  useEffect(() => {
    if (user && id) {
      supabase.from("watchlists").select("id").eq("user_id", user.id).eq("item_id", id).eq("item_type", "movie").maybeSingle()
        .then(({ data }) => { if (data) setIsInList(true); });
    }
  }, [user, id]); // Depende do user do useAuth

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

  // Loading inicial apenas do filme
  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 rounded-full animate-spin border-t-transparent"></div></div>;
  
  if (!movie || !movie.title) return <div className="bg-black min-h-screen text-white flex items-center justify-center text-xl">Filme não encontrado.</div>;

  return (
    <div className="bg-black min-h-screen text-gray-200 font-sans pb-20">
      {/* SEM NAVBAR AQUI - Ela vem do Layout */}
      
      <div className="relative w-full min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center fixed-bg" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})` }}>
          <div className="absolute inset-0 bg-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center pt-20">
          {/* Poster */}
          <div className="hidden md:block col-span-1 animate-in fade-in duration-700">
            <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="w-full rounded-xl shadow-2xl border border-gray-800" />
          </div>
          
          {/* Detalhes */}
          <div className="col-span-1 md:col-span-2 space-y-6 animate-in slide-in-from-right-10 duration-700">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
              <span className="text-green-400 font-bold border border-green-400/30 bg-green-400/10 px-2 py-0.5 rounded">{Math.round(movie.vote_average * 10)}% Relevância</span>
              <span>{movie.release_date?.split("-")[0]}</span>
              <span>{movie.runtime} min</span>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl line-clamp-4 md:line-clamp-none">{movie.overview}</p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link href={`/watch/movie/${movie.id}`} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition hover:scale-105 flex items-center gap-2 shadow-lg shadow-red-900/40">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Assistir
              </Link>
              
              <button onClick={toggleMyList} disabled={listLoading} className={`font-bold py-3 px-6 rounded-full transition border flex items-center gap-2 ${isInList ? "bg-green-600 border-green-600 text-white" : "bg-gray-800/60 border-gray-500 text-white hover:bg-gray-700"}`}>
                {/* Mostra loading circular se estiver a processar a lista */}
                {listLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : isInList ? "Na Lista" : "Minha Lista"}
              </button>
              
              {trailerKey && (
                <button onClick={() => setShowTrailer(true)} className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-full transition border border-white/30 flex items-center gap-2 backdrop-blur-md">Trailer</button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* ELENCO & RECOMENDAÇÕES */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {movie.credits?.cast?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">Elenco</h2>
            <div ref={castRef} {...castEvents(castRef)} className="flex gap-5 overflow-x-auto pb-4 no-scrollbar cursor-grab active:cursor-grabbing">
              {movie.credits.cast.slice(0, 15).map((actor) => (
                <div key={actor.id} className="flex-none w-32 group select-none">
                  <div className="w-28 h-28 mx-auto mb-3 rounded-full overflow-hidden border-2 border-gray-800 group-hover:border-red-600 transition">
                    <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/no-avatar.png"} alt={actor.name} onDragStart={(e) => e.preventDefault()} className="w-full h-full object-cover pointer-events-none" />
                  </div>
                  <p className="text-sm font-bold text-center truncate">{actor.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {movie.similar?.results?.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-red-600 pl-4">Recomendados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {movie.similar.results.slice(0, 10).map((sim) => (
                <Link key={sim.id} href={`/movies/${sim.id}`} className="group block relative">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-gray-800 shadow-lg group-hover:scale-105 transition duration-300">
                    <img src={sim.poster_path ? `https://image.tmdb.org/t/p/w500${sim.poster_path}` : "/no-image.jpg"} alt={sim.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-300 group-hover:text-white truncate">{sim.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal do Trailer */}
      {showTrailer && trailerKey && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden border border-gray-800">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-900">
               <span className="font-bold text-white">Trailer Oficial</span>
               <button onClick={() => setShowTrailer(false)} className="bg-gray-800 hover:bg-red-600 text-white rounded-full p-2 transition">✕</button>
            </div>
            <div className="aspect-video">
              <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}