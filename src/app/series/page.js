"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Carousel from "@/components/Carousel";
import DynamicTitle from "@/components/DynamicTitle";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

export default function SeriesPage() {
  const router = useRouter();
  const [genres, setGenres] = useState([]);
  const [seriesByGenre, setSeriesByGenre] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // géneros de séries
        const genreRes = await fetch(
          `https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=pt-BR`
        );
        const genreData = await genreRes.json();
        const genreList = genreData.genres || [];
        setGenres(genreList);

        // buscar séries de cada género em paralelo
        const promises = genreList.map((genre) =>
          fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&with_genres=${genre.id}&language=pt-BR&sort_by=popularity.desc&page=1`
          ).then((r) => r.json())
        );

        const results = await Promise.all(promises);

        const temp = {};
        results.forEach((data, idx) => {
          const genre = genreList[idx];
          if (!data?.results?.length) return;
          temp[genre.id] = data.results.map((serie) => ({
            ...serie,
            // 👇 marcamos como série para o Carousel não mandar para /movies
            type: "series",
          }));
        });

        setSeriesByGenre(temp);
      } catch (error) {
        console.error("Erro ao carregar séries:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <p className="pt-24 px-6">Carregando séries…</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <DynamicTitle pageTitle="Séries - LusoStream" />

      <div className="pt-24 px-6 pb-10">
        {genres.map((genre) => {
          const series = seriesByGenre[genre.id] || [];
          if (!series.length) return null;
          return (
            <div key={genre.id} className="mb-10">
              <h2 className="text-2xl font-bold mb-2">{genre.name}</h2>
              <Carousel items={series} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
