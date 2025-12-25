"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { searchMulti } from "@/lib/tmdb";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); // Lê ?q=...
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      setLoading(true);
      try {
        const data = await searchMulti(query);
        // Filtra para mostrar apenas Filmes e Séries (ignora atores)
        const filtered = data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");
        setResults(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [query]);

  if (!query) return <div className="text-center mt-20 text-gray-500">Escreve algo para pesquisar...</div>;
  if (loading) return <div className="text-center mt-20 text-white">A pesquisar...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <h1 className="text-3xl font-bold text-white mb-8">Resultados para: "{query}"</h1>
      
      {results.length === 0 ? (
        <p className="text-gray-400">Nenhum resultado encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {results.map((item) => (
            <Link 
              key={item.id} 
              href={item.media_type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`}
              className="group relative aspect-[2/3] bg-gray-800 rounded-xl overflow-hidden"
            >
              {item.poster_path ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                  alt={item.title || item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">Sem Imagem</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="font-bold text-white text-sm">{item.title || item.name}</p>
                <p className="text-xs text-gray-400 uppercase">{item.media_type === "movie" ? "Filme" : "Série"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// O Suspense é obrigatório no Next.js para usar useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SearchContent />
    </Suspense>
  );
}