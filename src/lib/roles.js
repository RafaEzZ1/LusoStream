// src/lib/roles.js
"use client";
import { supabase } from "@/lib/supabaseClient";

export async function getUserAndRole() {
  // pede a sessão atual (já hidrata do localStorage)
  const { data: sess } = await supabase.auth.getSession();
  const user = sess?.session?.user || null;
  if (!user) return { user: null, role: null, profile: null };

  // lê a role do perfil
  const { data, error } = await supabase
    .from("profiles")
    .select("role, username, avatar_url, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("getUserAndRole:", error.message);
    return { user, role: "user", profile: null };
  }

  return { user, role: data?.role || "user", profile: data || null };
}

export function isModOrAdmin(role) {
  return role === "mod" || role === "admin";
}
