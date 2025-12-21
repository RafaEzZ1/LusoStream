"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Carousel from "@/components/Carousel";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function AnimesPage() {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const moviesRes = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_keywords=210024&language=pt-BR&sort_by=popularity.desc&page=1`);
      const moviesData = await moviesRes.json();

      const tvRes = await fetch(`https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_keywords=210024&language=pt-BR&sort_by=popularity.desc&page=1`);
      const tvData = await tvRes.json();

      const allAnimes = [
        ...moviesData.results.map(item => ({
          ...item,
          image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          onClick: () => window.open(`/animes/${item.id}`, "_blank")
        })),
        ...tvData.results.map(item => ({
          ...item,
          image: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          onClick: () => window.open(`/animes/${item.id}`, "_blank")
        }))
      ];

      setAnimes(allAnimes);
    }

    fetchData();
  }, []);

  if (!animes.length) return <p className="text-white p-6">Carregando...</p>;

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-4">Animes Populares</h2>
        <Carousel movies={animes} />
      </div>
    </div>
  );
}
