
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY; 
const BASE_URL = "https://api.themoviedb.org/3";

export const getTrending = async (type = "movie") => {
  if (!API_KEY) { console.error("FALTA A API KEY"); return []; }
  try {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&language=pt-PT`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Erro getTrending:", error);
    return [];
  }
};

export const getPopular = async (type = "movie") => {
  if (!API_KEY) return [];
  try {
    const res = await fetch(`${BASE_URL}/${type}/popular?api_key=${API_KEY}&language=pt-PT`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Erro getPopular:", error);
    return [];
  }
};

export const getTopRated = async (type = "movie") => {
  if (!API_KEY) return [];
  try {
    const res = await fetch(`${BASE_URL}/${type}/top_rated?api_key=${API_KEY}&language=pt-PT`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Erro getTopRated:", error);
    return [];
  }
};

export const searchMulti = async (query) => {
  if (!API_KEY || !query) return { results: [] };
  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-PT&query=${encodeURIComponent(query)}&include_adult=false`);
    if (!res.ok) throw new Error("Erro na API");
    const data = await res.json();
    
    // Filtra para mostrar apenas filmes e séries que tenham imagem (poster)
    const filtered = (data.results || []).filter(item => 
      (item.media_type === 'movie' || item.media_type === 'tv') && item.poster_path
    );
    return { results: filtered };
  } catch (error) {
    console.error("Erro searchMulti:", error);
    return { results: [] };
  }
};