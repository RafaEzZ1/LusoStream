// src/middleware.js
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const url = req.nextUrl.clone();

  // 1. Só verifica sessão em rotas PROTEGIDAS
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/account')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  // 2. Se já tiver sessão e for para /auth, manda para casa
  if (url.pathname.startsWith('/auth')) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return res;
}

// Configuração para NÃO bloquear imagens nem filmes
export const config = {
  matcher: [
    '/admin/:path*', 
    '/account/:path*', 
    '/auth/:path*'
  ],
};