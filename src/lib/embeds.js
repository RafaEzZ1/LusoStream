// src/lib/embeds.js
"use client";
import { supabase } from "@/lib/supabaseClient";

/* =======================
   FILMES
======================= */
export async function getMovieEmbed(movieId) {
  const { data, error } = await supabase
    .from("movie_embeds")
    .select("url")
    .eq("movie_id", Number(movieId))
    .maybeSingle();

  if (error) {
    console.warn("getMovieEmbed error:", error.message);
    return null;
  }
  return data?.url || null;
}

export async function upsertMovieEmbed(movieId, url) {
  const { error } = await supabase
    .from("movie_embeds")
    .upsert(
      {
        movie_id: Number(movieId),
        url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "movie_id" }
    );

  return { error };
}

export async function deleteMovieEmbed(movieId) {
  const { error } = await supabase
    .from("movie_embeds")
    .delete()
    .eq("movie_id", Number(movieId));

  return { error };
}

/* =======================
   SÉRIES / EPISÓDIOS
======================= */
export async function getEpisodeEmbed(seriesId, season, episode) {
  const { data, error } = await supabase
    .from("episode_embeds")
    .select("url")
    .eq("series_id", Number(seriesId))
    .eq("season", Number(season))
    .eq("episode", Number(episode))
    .maybeSingle();

  if (error) {
    console.warn("getEpisodeEmbed error:", error.message);
    return null;
  }
  return data?.url || null;
}

export async function upsertEpisodeEmbed(seriesId, season, episode, url) {
  const { error } = await supabase
    .from("episode_embeds")
    .upsert(
      {
        series_id: Number(seriesId),
        season: Number(season),
        episode: Number(episode),
        url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "series_id,season,episode" }
    );

  return { error };
}

export async function deleteEpisodeEmbed(seriesId, season, episode) {
  const { error } = await supabase
    .from("episode_embeds")
    .delete()
    .eq("series_id", Number(seriesId))
    .eq("season", Number(season))
    .eq("episode", Number(episode));

  return { error };
}

/* =======================
   LISTAR EMBEDS POR TEMPORADA
   (para a página da série mostrar o botão "Ver Episódio")
======================= */
export async function listSeasonEmbeds(seriesId, season) {
  const { data, error } = await supabase
    .from("episode_embeds")
    .select("episode, url")
    .eq("series_id", Number(seriesId))
    .eq("season", Number(season));

  if (error) {
    console.warn("listSeasonEmbeds error:", error.message);
    return {};
  }

  const map = {};
  for (const row of data || []) {
    if (row?.episode && row?.url) map[row.episode] = row.url;
  }
  return map;
}
