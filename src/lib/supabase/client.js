import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // ESTAMOS A FORÇAR AS CHAVES DIRETAMENTE PARA TESTAR
  // Se isto funcionar, o problema é 100% das variáveis no Vercel
  const url = "https://pcdtxlqnkblrdvywuvnm.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZHR4bHFua2JscmR2eXd1dm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzg2MTIsImV4cCI6MjA3NjQ1NDYxMn0.KBb_ChU_IxYpiTRntNmQ55GtVCt2jzgFNHnvAHIOebk";

  return createBrowserClient(url, key)
}