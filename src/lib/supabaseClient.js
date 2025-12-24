// src/lib/supabaseClient.js
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ESTA É A CORREÇÃO MÁGICA:
// Em vez de 'createClient' normal, usamos este que sincroniza
// automaticamente com os Cookies do browser e o Middleware.
export const supabase = createClientComponentClient();

export const hardLogout = async () => {
  await supabase.auth.signOut();
  // Força um refresh total à página para limpar qualquer memória presa
  if (typeof window !== 'undefined') {
    window.location.href = "/auth";
  }
};