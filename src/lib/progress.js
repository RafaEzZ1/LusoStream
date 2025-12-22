// src/lib/progress.js
import { supabase } from "@/lib/supabaseClient";

/* NOTA: Simplificámos este ficheiro. 
  Como usamos Embeds (Iframes), não conseguimos saber os segundos exatos (watched_seconds).
  Por isso, usamos apenas dois estados: 
  - "watching" (quando entras na página)
  - "finished" (quando clicas no botão ou vais para o próximo episódio)
*/

/**
 * 1. MARCAR COMO A VER (Substitui o touchMovieProgress/touchEpisodeProgress)
 * Chamado automaticamente quando a página carrega.
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
      status: "watching", // Define como "A ver"
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id, item_type, item_id, season, episode" }
  );

  if (error) console.error("Erro markAsWatching:", error.message);
}

/**
 * 2. MARCAR COMO VISTO (Substitui o markMovieFinished/markEpisodeFinished)
 * Chamado quando clicas no botão "Marcar Visto".
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
      status: "finished", // Define como "Terminado"
      progress_percent: 100,
      updated_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: "user_id, item_type, item_id, season, episode" }
  );

  if (error) console.error("Erro markAsFinished:", error.message);
}

/**
 * 3. LISTAR CONTINUAR A VER (Para a Home Page)
 * Vai buscar tudo o que NÃO está "finished".
 */
export async function listContinueWatching(limit = 12) {
  // Nota: Nos componentes Client Side, passamos o userId como argumento ou pegamos da sessão antes
  // Mas para facilitar a chamada na Home, vamos buscar a sessão aqui se não for passada
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .neq("status", "finished") // Traz tudo o que não acabaste
    .order("last_seen_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.warn("Erro listContinueWatching:", error.message);
    return [];
  }

  return data || [];
}