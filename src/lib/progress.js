// src/lib/progress.js
import { supabase } from "@/lib/supabaseClient";

/**
 * Regista que o utilizador começou a ver algo (Status: watching)
 */
export async function markAsWatching(user, itemType, itemId, season = null, episode = null) {
  if (!user) return;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      season: season,
      episode: episode,
      status: "watching",
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id, item_type, item_id, season, episode" }
  );

  if (error) console.error("Erro ao gravar progresso:", error);
}

/**
 * Marca como terminado (Status: finished, 100%)
 */
export async function markAsFinished(user, itemType, itemId, season = null, episode = null) {
  if (!user) return;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      season: season,
      episode: episode,
      status: "finished",
      progress_percent: 100,
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id, item_type, item_id, season, episode" }
  );

  if (error) console.error("Erro ao marcar como visto:", error);
}