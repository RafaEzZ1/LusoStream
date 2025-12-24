import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("❌ ERRO GRAVE: Variáveis de Ambiente do Supabase não encontradas!");
    console.error("URL:", url);
    console.error("KEY:", key ? "Existe (Oculta)" : "Não existe");
  }

  return createBrowserClient(url, key);
}