import WatchEpisodeClient from "./WatchEpisodeClient";

// Função para obter nomes oficiais para o SEO
async function getSeriesSEO(id, season, episode) {
  try {
    const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e"; // A tua chave TMDB
    const baseUrl = "https://api.themoviedb.org/3";
    
    // Dados da Série
    const showReq = await fetch(`${baseUrl}/tv/${id}?api_key=${API_KEY}&language=pt-BR`);
    const show = await showReq.json();
    
    // Dados do Episódio (para saber o nome exato)
    const epReq = await fetch(`${baseUrl}/tv/${id}/season/${season}/episode/${episode}?api_key=${API_KEY}&language=pt-BR`);
    const ep = await epReq.json();

    return { show, ep };
  } catch (error) {
    return null;
  }
}

// O SEO PARA O GOOGLE
export async function generateMetadata({ params }) {
  const { id, season, episode } = await params;
  const data = await getSeriesSEO(id, season, episode);

  if (!data || !data.show) {
    return { title: "Episódio | LusoStream" };
  }

  const showName = data.show.name;
  const epName = data.ep.name || `Episódio ${episode}`;
  
  // Título: "House of the Dragon 2x1 Ver Online Grátis..."
  const title = `Assistir ${showName} ${season}x${episode} (${epName}) Online Grátis | LusoStream`;
  const description = `Vê o episódio ${episode} da Temporada ${season} de ${showName}: "${epName}". Streaming HD sem anúncios, legendado e dobrado em português.`;

  return {
    title: title,
    description: description,
    keywords: [`${showName} online`, `ver ${showName} temporada ${season}`, "episodio gratis", "legendado", "lusostream"],
    openGraph: {
      title: title,
      description: description,
      images: [`https://image.tmdb.org/t/p/w780${data.show.backdrop_path || data.show.poster_path}`],
      type: 'video.tv_show',
    },
  };
}

// A PÁGINA REAL
export default async function Page({ params }) {
  const { id, season, episode } = await params;
  // Chama o cliente com o player
  return <WatchEpisodeClient id={id} season={season} episode={episode} />;
}