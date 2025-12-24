import { createClient } from "@/lib/supabase/client";

// Obter Filme
export async function getMovieEmbed(movieId) {
  const supabase = createClient();
  const { data } = await supabase
    .from("movie_embeds")
    .select("embed_url")
    .eq("movie_id", movieId)
    .maybeSingle();
  return data?.embed_url || null;
}

// Guardar Filme
export async function upsertMovieEmbed(movieId, url) {
  const supabase = createClient();
  if (!url) {
    return await supabase.from("movie_embeds").delete().eq("movie_id", movieId);
  }
  return await supabase.from("movie_embeds").upsert({ movie_id: movieId, embed_url: url });
}

// Obter Episódio
export async function getEpisodeEmbed(seriesId, season, episode) {
  const supabase = createClient();
  const { data } = await supabase
    .from("episode_embeds")
    .select("embed_url")
    .eq("tmdb_id", seriesId)
    .eq("season", season)
    .eq("episode", episode)
    .maybeSingle();
  return data?.embed_url || null;
}

// Guardar Episódio
export async function upsertEpisodeEmbed(seriesId, season, episode, url) {
  const supabase = createClient();
  if (!url) {
    return await supabase.from("episode_embeds").delete()
      .eq("tmdb_id", seriesId).eq("season", season).eq("episode", episode);
  }
  return await supabase.from("episode_embeds").upsert({
    tmdb_id: seriesId, season, episode, embed_url: url
  });
}