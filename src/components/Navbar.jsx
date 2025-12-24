"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  
  // Estado local para garantir rapidez visual
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de UI
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // 1. Carregar utilizador (SEM bloquear a UI)
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);

    async function getUserData() {
      // Verifica sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Verifica se é Admin (sem bloquear o resto da navbar)
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (profile?.role === "admin") setIsAdmin(true);
      }
      setLoading(false);
    }

    getUserData();

    // Ouve mudanças na autenticação (Login/Logout em tempo real)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setIsAdmin(false);
    });

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && !searchText) {
        setSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      subscription.unsubscribe();
    };
  }, [supabase, searchText]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setShowDropdown(false);
    router.refresh();
    router.push("/auth");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchText)}`);
      setSearchOpen(false);
    }
  }

  // --- AQUI ESTAVA O ERRO: REMOVI O "if (loading) return null" ---
  // A Navbar agora renderiza SEMPRE, independentemente do estado.

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-black/90 backdrop-blur-md shadow-lg border-b border-white/5" : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO - Sempre visível */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group relative z-50">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter cursor-pointer">
                LUSO<span className="text-red-600 group-hover:text-red-500 transition-colors">STREAM</span>
              </h1>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
              <NavLink href="/">Início</NavLink>
              <NavLink href="/series">Séries</NavLink>
              <NavLink href="/movies">Filmes</NavLink>
              <NavLink href="/suggestions">Pedidos</NavLink>
              
              {isAdmin && (
                <Link href="/admin" className="text-red-500 hover:text-red-400 font-bold transition-colors border border-red-500/30 px-3 py-1 rounded bg-red-500/10">
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* DIREITA - Pesquisa e Avatar */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Pesquisa */}
            <div ref={searchRef} className={`flex items-center transition-all duration-300 ${searchOpen ? "bg-black/50 border border-white/20 px-3 py-1.5 rounded-full w-48 md:w-64" : "w-8"}`}>
               <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-300 hover:text-white">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </button>
               <form onSubmit={handleSearch} className={`flex-1 ml-2 ${searchOpen ? "block" : "hidden"}`}>
                 <input 
                   type="text" 
                   value={searchText}
                   onChange={(e) => setSearchText(e.target.value)}
                   placeholder="Pesquisar..." 
                   className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
                 />
               </form>
            </div>

            {/* ZONA DE UTILIZADOR */}
            {/* Se estiver a carregar, mostra um "esqueleto" redondo para não saltar */}
            {loading ? (
              <div className="w-9 h-9 rounded-lg bg-gray-800 animate-pulse border border-white/10"></div>
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 group focus:outline-none">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/20 group-hover:border-white/50 transition bg-gray-800">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_metadata?.username || user.email}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-white font-bold text-sm truncate">{user.user_metadata?.username || "Membro"}</p>
                      {isAdmin && <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded text-white font-bold uppercase tracking-wide">ADMIN</span>}
                    </div>
                    
                    <DropdownLink href="/account">Minha Conta</DropdownLink>
                    <DropdownLink href="/suggestions">Meus Pedidos</DropdownLink>
                    {isAdmin && <DropdownLink href="/admin">Painel Admin</DropdownLink>}
                    
                    <div className="border-t border-white/5 mt-2 pt-2">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors">
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-red-900/20 hover:scale-105">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }) {
  return (
    <Link href={href} className="relative group py-2">
      <span className="group-hover:text-white transition-colors">{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function DropdownLink({ href, children }) {
  return (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
      {children}
    </Link>
  );
}