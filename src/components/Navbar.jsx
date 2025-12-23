// src/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Deteta scroll para mudar a cor da navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Verifica utilizador logado
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-colors duration-300 ${isScrolled ? "bg-black/95 shadow-lg backdrop-blur-sm" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* ESQUERDA: Logo e Links Principais */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl md:text-3xl font-bold text-red-600 tracking-tighter hover:text-red-500 transition scale-100 hover:scale-105 duration-200">
              LusoStream
            </Link>

            <ul className="hidden md:flex space-x-6 text-sm font-medium text-gray-300">
              <li><Link href="/" className="hover:text-white transition">Início</Link></li>
              <li><Link href="/movies" className="hover:text-white transition">Filmes</Link></li>
              <li><Link href="/series" className="hover:text-white transition">Séries</Link></li>
            </ul>
          </div>

          {/* DIREITA: Pesquisa e Perfil */}
          <div className="hidden md:flex items-center gap-6">
            {/* Barra de Pesquisa */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-gray-900/80 border border-gray-700 text-sm rounded-full pl-4 pr-10 py-1.5 w-32 focus:w-64 transition-all duration-300 outline-none text-white focus:border-red-600 focus:ring-1 focus:ring-red-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
              <svg className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Área do Utilizador */}
            {user ? (
              <div className="flex items-center gap-4">
                 {/* Ícone Admin (opcional, só mostra se quiseres lógica de admin futura) */}
                 {user.email === "Streamyme1@proton.me" && (
                    <Link href="/admin" className="text-yellow-500 hover:text-yellow-400 text-xs uppercase font-bold border border-yellow-500 px-2 py-1 rounded">
                      Admin
                    </Link>
                 )}
                 <button onClick={handleLogout} className="text-sm font-medium text-gray-300 hover:text-white transition hover:underline">
                   Sair
                 </button>
                 <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent hover:ring-white transition">
                   {user.email[0].toUpperCase()}
                 </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link href="/auth" className="text-gray-300 hover:text-white transition">Login</Link>
                <Link href="/auth" className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full transition transform hover:scale-105 shadow-lg shadow-red-900/30">
                  Registar
                </Link>
              </div>
            )}
          </div>

          {/* MENU MOBILE (Hambúrguer) */}
          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* DRAWER MOBILE */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-gray-800 absolute w-full left-0 px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
           <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Link href="/" className="block py-2 text-gray-300 hover:text-white border-b border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Início</Link>
            <Link href="/movies" className="block py-2 text-gray-300 hover:text-white border-b border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Filmes</Link>
            <Link href="/series" className="block py-2 text-gray-300 hover:text-white border-b border-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Séries</Link>
            
            {user ? (
              <button onClick={handleLogout} className="text-left py-2 text-red-500 font-bold">Sair</button>
            ) : (
              <Link href="/auth" className="block py-2 text-white font-bold" onClick={() => setIsMobileMenuOpen(false)}>Entrar / Registar</Link>
            )}
        </div>
      )}
    </nav>
  );
}