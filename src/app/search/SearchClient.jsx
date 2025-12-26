"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { searchMulti } from "@/lib/tmdb";
import Link from "next/link";
import { FaStar, FaSearch, FaExclamationCircle } from "react-icons/fa";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  
  // Estado inicial é true se houver uma query no URL
  const [loading, setLoading] = useState(!!initialQuery); 
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    // Se a caixa estiver vazia, limpa tudo e para de carregar
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true); // Começa a carregar imediatamente ao escrever

    const timer = setTimeout(async () => {
      try {
        const data = await searchMulti(query);
        setResults(data.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Só para de carregar no fim
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-[#050505] pt-28 px-4 md:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Input */}
        <div className="relative group z-50">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <FaSearch className="text-zinc-500 group-focus-within:text-purple-500 transition-colors text-xl" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escreve o nome do filme ou série..."
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-white text-lg placeholder:text-zinc-600 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-900/20 transition-all shadow-2xl appearance-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-zinc-500 font-medium">A procurar nos arquivos...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.map((item) => (
              <Link 
                key={item.id} 
                href={item.media_type === 'movie' ? `/movies/${item.id}` : `/series/${item.id}`}
                className="group relative aspect-[2/3] bg-zinc-800 rounded-xl overflow-hidden border border-white/5 hover:border-purple-500 transition-all active:scale-95 shadow-lg"
              >
                {item.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                    alt={item.title || item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700 text-xs font-bold uppercase p-4 text-center">
                    Sem Imagem
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  <p className="text-white font-bold text-sm truncate">{item.title || item.name}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">
                    <span>{item.media_type === 'movie' ? 'Filme' : 'Série'}</span>
                    <span className="flex items-center gap-1 text-yellow-500"><FaStar /> {item.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : query.length > 1 ? (
          <div className="text-center py-20 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-600">
               <FaExclamationCircle size={24} />
            </div>
            <div>
              <h3 className="text-zinc-300 text-lg font-bold">Sem resultados</h3>
              <p className="text-zinc-600 text-sm max-w-xs mx-auto">Não encontrámos nada com esse nome.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 opacity-20 select-none">
            <FaSearch className="text-8xl mx-auto mb-6" />
            <p className="font-black text-2xl uppercase tracking-widest">Pesquisar</p>
          </div>
        )}
      </div>
    </div>
  );
}