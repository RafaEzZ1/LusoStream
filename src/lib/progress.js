import { createClient } from "@/lib/supabase/client";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

// Esta função já existia, mantemos igual
export async function listContinueWatching(limit = 10) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: progressRows } = await supabase
    .from("continue_watching")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (!progressRows || progressRows.length === 0) return [];

  const enriched = await Promise.all(
    progressRows.map(async (row) => {
      try {
        const apiType = row.item_type === "movie" ? "movie" : "tv";
        const res = await fetch(
          `https://api.themoviedb.org/3/${apiType}/${row.item_id}?api_key=${API_KEY}&language=pt-BR`
        );
        const tmdb = await res.json();
        
        if (!tmdb.id) return null;

        return {
          ...tmdb,
          item_type: row.item_type,
          progress_percent: row.progress_percent,
          season_number: row.season_number,
          episode_number: row.episode_number,
        };
      } catch (e) {
        return null;
      }
    })
  );

  return enriched.filter((item) => item !== null);
}

// --- NOVAS FUNÇÕES ADICIONADAS (Isto corrige o erro de build) ---

export async function markAsWatching(id, type, percent, season = null, episode = null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const updateData = {
    user_id: user.id,
    item_id: id,
    item_type: type, // 'movie' ou 'series'
    progress_percent: percent,
    updated_at: new Date().toISOString(),
  };

  // Só adiciona temporada/episódio se existirem (para séries)
  if (season) updateData.season_number = season;
  if (episode) updateData.episode_number = episode;

  // Tenta atualizar ou criar um novo registo
  const { error } = await supabase
    .from("continue_watching")
    .upsert(updateData, { onConflict: "user_id, item_id, item_type" });

  if (error) {
    console.error("Erro ao salvar progresso:", error);
  }
}

export async function markAsFinished(id, type, season = null, episode = null) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  // Quando termina, podemos remover da lista de "continuar a ver" 
  // OU marcar como 100%. Aqui vou remover para limpar a lista da home.
  const query = supabase
    .from("continue_watching")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", id)
    .eq("item_type", type);

  if (season) query.eq("season_number", season);
  if (episode) query.eq("episode_number", episode);

  const { error } = await query;

  if (error) {
    console.error("Erro ao marcar como terminado:", error);
  }
}