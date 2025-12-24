// src/lib/suggestions.js
import { createClient } from "@/lib/supabase/client";

export async function createSuggestion({ title, body, category = "other" }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "not-auth" };

  const { error } = await supabase.from("suggestions").insert({
    user_id: user.id,
    title,
    body,
    category,
  });

  if (error) {
    console.error("createSuggestion error:", error);
    return { ok: false, error };
  }
  return { ok: true };
}

export async function listMySuggestions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { ok: true, items: [] };

  const { data: rows, error } = await supabase
    .from("suggestions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { ok: false, items: [], error };
  return { ok: true, items: rows || [] };
}

export async function listAllSuggestions() {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { ok: false, items: [], error };
  return { ok: true, items: rows || [] };
}

export async function adminReplySuggestion(id, { admin_reply, status }) {
  const supabase = createClient();
  const patch = {};
  if (typeof admin_reply === "string") patch.admin_reply = admin_reply;
  if (status) patch.status = status;
  patch.reply_at = new Date().toISOString();

  const { error } = await supabase
    .from("suggestions")
    .update(patch)
    .eq("id", id);

  if (error) return { ok: false, error };
  return { ok: true };
}