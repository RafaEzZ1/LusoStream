import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // DEBUG: Ver que página está a ser pedida
  console.log(`[Middleware] Acedendo a: ${request.nextUrl.pathname}`)

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // DEBUG: Tentar ler o utilizador
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      console.error(`[Middleware] Erro Auth: ${error.message}`)
    } else if (user) {
      console.log(`[Middleware] Utilizador autenticado: ${user.email}`)
    } else {
      console.log(`[Middleware] Nenhum utilizador detetado (Visitante)`)
    }

    // Proteção de Rotas
    if (request.nextUrl.pathname.startsWith('/admin') && !user) {
      console.log(`[Middleware] Bloqueio Admin -> Redirecionar para Auth`)
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    if (request.nextUrl.pathname.startsWith('/account') && !user) {
      console.log(`[Middleware] Bloqueio Conta -> Redirecionar para Auth`)
      return NextResponse.redirect(new URL('/auth', request.url))
    }

  } catch (err) {
    console.error(`[Middleware] ERRO CRÍTICO:`, err)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}