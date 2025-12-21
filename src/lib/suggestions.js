// src/lib/suggestions.js
"use client";

import { supabase, readUser } from "@/lib/supabaseClient";

/**
 * Cria uma sugestão (user autenticado)
 * @param {{title:string, body:string, category?:'bug'|'feature'|'content'|'other'}} payload
 */
export async function createSuggestion({ title, body, category = "other" }) {
  const { user, reset } = await readUser();
  if (reset) {
    console.warn("createSuggestion: sessão local foi reiniciada");
  }
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

// ... restantes utilitários de sugestões ...


/** Lista sugestões do próprio utilizador */
export async function listMySuggestions() {
  const { user, reset } = await readUser();
  if (reset) {
    console.warn("listMySuggestions: sessão local foi reiniciada");
  }
  if (!user) return { ok: true, items: [] };

  const { data: rows, error } = await supabase
    .from("suggestions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listMySuggestions error:", error);
    return { ok: false, items: [], error };
  }
  return { ok: true, items: rows || [] };
}

/** Lista todas as sugestões (RLS deixa passar só para admin/mod) */
export async function listAllSuggestions() {
  const { data: rows, error } = await supabase
    .from("suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAllSuggestions error:", error);
    return { ok: false, items: [], error };
  }
  return { ok: true, items: rows || [] };
}

/**
 * Admin responde e/ou muda o estado
 * @param {string} id
 * @param {{ admin_reply?: string, status?: 'open'|'in_progress'|'done'|'rejected' }} patch
 */
export async function adminReplySuggestion(id, { admin_reply, status }) {
  const patch = {};
  if (typeof admin_reply === "string") patch.admin_reply = admin_reply;
  if (status) patch.status = status;
  patch.reply_at = new Date().toISOString();

  const { error } = await supabase
    .from("suggestions")
    .update(patch)
    .eq("id", id);

  if (error) {
    console.error("adminReplySuggestion error:", error);
    return { ok: false, error };
  }
  return { ok: true };
}
