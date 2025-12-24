import { createClient } from "@/lib/supabase/client";

const API_KEY = "f0bde271cd8fdf3dea9cd8582b100a8e";

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