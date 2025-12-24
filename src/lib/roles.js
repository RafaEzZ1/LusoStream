import { createClient } from "@/lib/supabase/client";

export const ROLES = {
  ADMIN: "admin",
  MOD: "mod",
  USER: "user",
};

export async function getUserAndRole() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null };

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, role: data?.role || "user" };
}

export function isModOrAdmin(role) {
  return role === ROLES.ADMIN || role === ROLES.MOD;
}