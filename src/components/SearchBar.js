"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=pt-BR&query=${query}`
          ),
          fetch(
            `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=pt-BR&query=${query}`
          ),
        ]);

        const [moviesData, seriesData] = await Promise.all([
          moviesRes.json(),
          seriesRes.json(),
        ]);

        const combined = [
          ...moviesData.results.map((item) => ({ ...item, type: "movie" })),
          ...seriesData.results.map((item) => ({ ...item, type: "series" })),
        ];

        setResults(combined.slice(0, 8));
        setShowResults(true);
      } catch (err) {
        console.error(err);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleSelect = (item) => {
    window.open(
      item.type === "movie" ? `/movies/${item.id}` : `/series/${item.id}`,
      "_blank"
    );
    setShowResults(false);
    setQuery("");
  };

  return (
    <div className="relative w-full md:w-1/3">
      <input
        type="text"
        placeholder="Pesquisar filmes ou séries..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => query && setShowResults(true)}
        className="w-full px-4 py-2 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-600 transition"
      />

      {showResults && results.length > 0 && (
        <ul
          className="absolute z-50 w-full bg-gray-900 border border-gray-700 rounded-lg mt-2 max-h-96 overflow-y-auto shadow-lg"
          onMouseLeave={() => setShowResults(false)}
        >
          {results.map((item) => (
            <li
              key={item.id + item.type}
              onClick={() => handleSelect(item)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-700 cursor-pointer transition"
            >
              <img
                src={
                  item.poster_path
                    ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                    : "/no-image.jpg"
                }
                alt={item.title || item.name}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex flex-col">
                <span className="font-semibold text-sm">
                  {item.title || item.name}
                </span>
                <span className="text-gray-400 text-xs">
                  {item.release_date
                    ? item.release_date.slice(0, 4)
                    : item.first_air_date
                    ? item.first_air_date.slice(0, 4)
                    : "—"}{" "}
                  • {item.type === "movie" ? "Filme" : "Série"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
