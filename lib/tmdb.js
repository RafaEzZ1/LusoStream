const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";
const BASE_URL = "https://api.themoviedb.org/3";

export async function getPopularMovies() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`);
  if (!res.ok) throw new Error("Falha ao buscar filmes TMDb");
  const data = await res.json();
  return data.results;
}

// ESTA É A FUNÇÃO QUE FALTAVA
export async function searchMulti(query) {
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
  if (!res.ok) throw new Error("Falha ao pesquisar no TMDb");
  const data = await res.json();
  return data;
}