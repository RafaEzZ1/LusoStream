"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Carousel from "@/components/Carousel";
import DynamicTitle from "@/components/DynamicTitle";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function MoviesPage() {
  const [genres, setGenres] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) buscar géneros
        const genreRes = await fetch(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=pt-BR`
        );
        const genreData = await genreRes.json();
        const genreList = genreData.genres || [];
        setGenres(genreList);

        // 2) buscar filmes de cada género (em paralelo para ser mais rápido)
        const promises = genreList.map((genre) =>
          fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genre.id}&language=pt-BR&sort_by=popularity.desc&page=1`
          ).then((r) => r.json())
        );

        const results = await Promise.all(promises);

        const temp = {};
        results.forEach((data, idx) => {
          const genre = genreList[idx];
          if (!data?.results?.length) return;

          temp[genre.id] = data.results.map((movie) => ({
            ...movie,
            // 👇 isto é o mais importante: dizer ao Carousel que isto é FILME
            type: "movie",
          }));
        });

        setMoviesByGenre(temp);
      } catch (err) {
        console.error("Erro ao carregar filmes por gênero:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <p className="pt-24 px-6">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle="Filmes - LusoStream" />

      <div className="pt-24 px-6 pb-10">
        {genres.map((genre) => {
          const movies = moviesByGenre[genre.id];
          if (!movies || movies.length === 0) return null;
          return (
            <div key={genre.id} className="mb-8">
              <h2 className="text-2xl font-bold mb-2">{genre.name}</h2>
              <Carousel items={movies} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
