import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Atualiza a sessão (importante para manter o cookie válido)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // --- REGRA DE PROTEÇÃO DE ADMIN ---
  // Se a pessoa tentar entrar em qualquer link que comece por "/admin"
  if (req.nextUrl.pathname.startsWith('/admin')) {
    
    // 1. Se não estiver logado, manda para o Login
    if (!session) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }

    // 2. (Opcional) Verificar Role no Middleware
    // Nota: Ler a base de dados aqui pode tornar o site um pouco mais lento.
    // Geralmente verificamos a SESSÃO aqui e a ROLE no Layout (Passo 3).
    // Mas se quiseres segurança máxima, podes descomentar e adaptar o código abaixo:
    /*
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
    */
  }

  return res
}

// Configuração: Diz ao Next.js em que rotas este ficheiro deve correr
export const config = {
  matcher: ['/admin/:path*'],
}