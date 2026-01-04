import { getMovie } from "@/lib/tmdb";
import WatchMovieClient from "./WatchMovieClient"; // Importa o ficheiro que criámos acima

// ISTO É O QUE O GOOGLE VÊ
export async function generateMetadata({ params }) {
  const { id } = await params; // Next.js 15 exige await nos params
  const movie = await getMovie(id);

  if (!movie) {
    return { title: "Filme não encontrado | LusoStream" };
  }

  // O Título "Isco" para aparecer no topo das pesquisas
  const title = `Assistir ${movie.title} Online Grátis Legendado e Dobrado | LusoStream`;
  const description = `Vê o filme ${movie.title} (${movie.release_date?.split('-')[0]}) completo online grátis em HD. Streaming sem falhas, legendado em português e dobrado.`;

  return {
    title: title,
    description: description,
    keywords: [`${movie.title} online`, "ver filme gratis", "legendado", "dobrado", "lusostream", "full hd"],
    openGraph: {
      title: title,
      description: description,
      images: [`https://image.tmdb.org/t/p/w780${movie.backdrop_path || movie.poster_path}`],
      type: 'video.movie',
    },
  };
}

// A PÁGINA REAL
export default async function WatchMoviePage({ params }) {
  const { id } = await params;
  // Passamos apenas o ID para o Cliente, para ele ir buscar os links ao Firebase
  return <WatchMovieClient id={id} />;
}