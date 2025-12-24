// src/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  // Criar cliente Supabase para gerir a sessão no servidor
  const supabase = createMiddlewareClient({ req, res });

  const url = req.nextUrl.clone();

  // 1. Apenas renovamos a sessão se for estritamente necessário
  // (Evita chamadas excessivas ao Supabase que encravam o site)
  
  // Se for uma rota de ADMIN ou CONTA, aí sim, verificamos segurança máxima
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/account')) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      // Se não houver sessão, manda para login
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  // Se já estiver logado e tentar ir para o Login (/auth), manda para a Home
  if (url.pathname.startsWith('/auth')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

// CONFIGURAÇÃO DE PERFORMANCE (Muito Importante)
// Isto impede o middleware de correr em imagens, logos, api, etc.
// Resolve o problema do site ficar lento "de repente".
export const config = {
  matcher: [
    /*
     * Corresponde apenas a estas rotas críticas.
     * Tudo o resto (filmes, series, imagens) passa direto sem bloquear.
     */
    '/admin/:path*', 
    '/account/:path*', 
    '/auth/:path*'
  ],
};