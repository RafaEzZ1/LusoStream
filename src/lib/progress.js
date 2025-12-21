// src/lib/progress.js
"use client";

import { supabase } from "@/lib/supabaseClient";

const FINISH_FRACTION = 0.9;

// este helper agora procura primeiro TODAS as linhas do user+tipo+id
// e depois faz o match em JS com (season ?? 0) e (episode ?? 0)
// assim apanhamos linhas antigas que ficaram com 0
async function upsertUserProgress({
  user_id,
  item_type,
  item_id,
  season = null,
  episode = null,
  watched_seconds = 0,
  estimated_duration_seconds = null,
  status = "in_progress",
}) {
  const seasonKey = season == null ? 0 : Number(season);
  const episodeKey = episode == null ? 0 : Number(episode);

  // 1) buscar todas as linhas desse user + item
  const { data: rows, error: selError } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user_id)
    .eq("item_type", item_type)
    .eq("item_id", item_id);

  if (selError) {
    console.warn("user_progress select erro:", selError.message);
  }

  // 2) tentar encontrar linha certa (season/episode) mesmo que tenha sido gravada com 0
  const existing =
    rows?.find(
      (r) =>
        (r.season ?? 0) === seasonKey &&
        (r.episode ?? 0) === episodeKey
    ) || null;

  const now = new Date().toISOString();

  if (existing) {
    const { error: updError } = await supabase
      .from("user_progress")
      .update({
        watched_seconds,
        estimated_duration_seconds,
        status,
        last_seen_at: now,
        updated_at: now,
      })
      .eq("id", existing.id);

    if (updError) {
      console.warn("update user_progress erro:", updError.message);
      return { ok: false, error: updError };
    }
    return { ok: true, id: existing.id };
  }

  // 3) se não havia, insere
  const { data: ins, error: insError } = await supabase
    .from("user_progress")
    .insert([
      {
        user_id,
        item_type,
        item_id: Number(item_id),
        season: seasonKey === 0 ? null : seasonKey,
        episode: episodeKey === 0 ? null : episodeKey,
        watched_seconds,
        estimated_duration_seconds,
        status,
        last_seen_at: now,
        updated_at: now,
      },
    ])
    .select()
    .maybeSingle();

  if (insError) {
    console.warn("insert user_progress erro:", insError.message);
    return { ok: false, error: insError };
  }

  return { ok: true, id: ins?.id };
}

/* ==== FILMES ==== */

export async function touchMovieProgress(movieId, extra = {}) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return { ok: false, reason: "no-user" };

  return upsertUserProgress({
    user_id: user.id,
    item_type: "movie",
    item_id: movieId,
    watched_seconds: extra.watched_seconds ?? 0,
    estimated_duration_seconds: extra.estimated_duration_seconds ?? null,
    status: extra.status ?? "in_progress",
  });
}

export async function markMovieFinished(movieId) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return { ok: false, reason: "no-user" };

  return upsertUserProgress({
    user_id: user.id,
    item_type: "movie",
    item_id: movieId,
    watched_seconds: 9999,
    estimated_duration_seconds: 9999,
    status: "finished",
  });
}

export async function isMovieCompleted(movieId) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_progress")
    .select("status, watched_seconds, estimated_duration_seconds")
    .eq("user_id", user.id)
    .eq("item_type", "movie")
    .eq("item_id", movieId)
    .maybeSingle();

  if (error || !data) return false;

  if (data.status === "finished") return true;

  if (
    data.estimated_duration_seconds &&
    data.watched_seconds / data.estimated_duration_seconds >= FINISH_FRACTION
  ) {
    return true;
  }

  return false;
}

/* ==== SÉRIES ==== */

export async function touchEpisodeProgress(seriesId, season, episode, extra = {}) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return { ok: false, reason: "no-user" };

  return upsertUserProgress({
    user_id: user.id,
    item_type: "series",
    item_id: seriesId,
    season,
    episode,
    watched_seconds: extra.watched_seconds ?? 0,
    estimated_duration_seconds: extra.estimated_duration_seconds ?? null,
    status: extra.status ?? "in_progress",
  });
}

export async function markEpisodeFinished(seriesId, season, episode) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return { ok: false, reason: "no-user" };

  return upsertUserProgress({
    user_id: user.id,
    item_type: "series",
    item_id: seriesId,
    season,
    episode,
    watched_seconds: 9999,
    estimated_duration_seconds: 9999,
    status: "finished",
  });
}

export async function isEpisodeCompleted(seriesId, season, episode) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_progress")
    .select("status, watched_seconds, estimated_duration_seconds")
    .eq("user_id", user.id)
    .eq("item_type", "series")
    .eq("item_id", seriesId)
    .eq("season", season)
    .eq("episode", episode)
    .maybeSingle();

  if (error || !data) return false;

  if (data.status === "finished") return true;

  if (
    data.estimated_duration_seconds &&
    data.watched_seconds / data.estimated_duration_seconds >= FINISH_FRACTION
  ) {
    return true;
  }

  return false;
}

/* ==== CONTINUAR A VER (HOME) ==== */
// devolve TUDO o que NÃO está terminado
export async function listContinueWatching(limit = 12) {
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;
  if (!user) return { ok: true, items: [], source: "anon" };

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "in_progress")          // 👈 só itens em progresso
    // .neq("status", "finished")         // <-- já não precisamos disto
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("listContinueWatching erro:", error.message);
    return { ok: false, items: [], error };
  }

  return { ok: true, items: data || [], source: "db" };
}

