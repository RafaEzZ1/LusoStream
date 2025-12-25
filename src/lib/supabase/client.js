import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // ⚠️ MODO DE EMERGÊNCIA: Chaves diretas para garantir conexão
  // URL e Chave ANON fornecidas por ti
  const SUPABASE_URL = "https://pcdtxlqnkblrdvywuvnm.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZHR4bHFua2JscmR2eXd1dm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzg2MTIsImV4cCI6MjA3NjQ1NDYxMn0.KBb_ChU_IxYpiTRntNmQ55GtVCt2jzgFNHnvAHIOebk";

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}