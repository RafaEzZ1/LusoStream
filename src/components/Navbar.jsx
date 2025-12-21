"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
// 👇 Importar o hook de roles para saber se é admin
import { useAuthRole } from "@/hooks/useAuthRole";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  
  // 👇 Lógica de Admin e Notificações
  const { role, user } = useAuthRole(); // O teu hook personalizado
  const [pendingCount, setPendingCount] = useState(0);

  // Efeito de scroll (visual)
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 👇 Efeito para contar pendentes (Só corre se for Admin)
  useEffect(() => {
    async function checkPending() {
      if (role !== "admin") return;

      // 1. Contar Reports Pendentes
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true }) // head: true é mais leve, só traz o número
        .eq("status", "pending");

      // 2. Contar Sugestões Pendentes (assumindo que status 'pending' é o inicial)
      const { count: suggestionsCount } = await supabase
        .from("suggestions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setPendingCount((reportsCount || 0) + (suggestionsCount || 0));
    }

    if (user && role === "admin") {
      checkPending();
      
      // Opcional: Atualizar a cada 30 segundos para parecer "tempo real" sem usar websockets pesados
      const interval = setInterval(checkPending, 30000);
      return () => clearInterval(interval);
    }
  }, [user, role]);

  // Fechar menu mobile ao mudar de página
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Filmes", href: "/movies" },
    { name: "Séries", href: "/series" },
    { name: "Animes", href: "/animes" },
    { name: "Pedidos", href: "/suggestions" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-red-600 font-bold text-2xl tracking-tighter hover:text-red-500 transition">
              LUSOSTREAM
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-white bg-white/10"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* 👇 BOTÃO DE ADMIN COM NOTIFICAÇÃO */}
              {role === "admin" && (
                <Link
                  href="/admin"
                  className="relative px-3 py-2 rounded-md text-sm font-bold text-red-100 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 transition-colors flex items-center gap-2"
                >
                  Admin
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm border border-black">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right Side (Search & Auth) */}
          <div className="hidden md:flex items-center gap-4">
             <Link href="/search" className="text-gray-300 hover:text-white transition">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
               </svg>
             </Link>

             {user ? (
               <Link href="/account">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-600 p-[1px]">
                   <img 
                     src={user.user_metadata?.avatar_url || "/no-image.jpg"} 
                     alt="Avatar"
                     className="w-full h-full rounded-full object-cover border-2 border-black"
                   />
                 </div>
               </Link>
             ) : (
               <Link href="/auth" className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition">
                 Entrar
               </Link>
             )}
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Abrir menu</span>
              {/* Ícone Menu / X */}
              {isOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.name}
              </Link>
            ))}

            {/* Admin Mobile */}
            {role === "admin" && (
               <Link
                href="/admin"
                className="text-red-400 hover:text-red-300 block px-3 py-2 rounded-md text-base font-bold flex items-center justify-between"
              >
                Painel de Admin
                {pendingCount > 0 && (
                   <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                     {pendingCount} novos
                   </span>
                )}
              </Link>
            )}

            <div className="border-t border-gray-800 my-2"></div>
            
            <Link href="/search" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
              🔍 Pesquisar
            </Link>

            {user ? (
              <Link href="/account" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                👤 Minha Conta
              </Link>
            ) : (
              <Link href="/auth" className="text-white bg-red-600 block px-3 py-2 rounded-md text-base font-medium text-center mt-4">
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}