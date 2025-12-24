"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  
  // Refs para detetar cliques fora
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Detetar Scroll e User
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);

    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    // Listener para cliques fora (fecha dropdowns)
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
    };
  }, [searchText]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? "bg-black/80 backdrop-blur-md shadow-lg border-b border-white/5" : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LADO ESQUERDO: Logo e Menu Principal */}
          <div className="flex items-center gap-8">
            <Link href="/" className="group relative">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter cursor-pointer">
                LUSO<span className="text-red-600 group-hover:text-red-500 transition-colors">STREAM</span>
              </h1>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
              <NavLink href="/">Início</NavLink>
              <NavLink href="/series">Séries</NavLink>
              <NavLink href="/movies">Filmes</NavLink>
              <NavLink href="/suggestions">Pedidos</NavLink>
            </div>
          </div>

          {/* LADO DIREITO: Pesquisa e User */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Barra de Pesquisa Expansível */}
            <div ref={searchRef} className={`flex items-center transition-all duration-300 ${searchOpen ? "bg-black/50 border border-white/20 px-3 py-1.5 rounded-full w-48 md:w-64" : "w-8"}`}>
               <button onClick={() => setSearchOpen(!searchOpen)} className="text-gray-300 hover:text-white">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               </button>
               <form onSubmit={handleSearch} className={`flex-1 ml-2 ${searchOpen ? "block" : "hidden"}`}>
                 <input 
                   type="text" 
                   value={searchText}
                   onChange={(e) => setSearchText(e.target.value)}
                   placeholder="Títulos, atores..." 
                   className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
                   autoFocus
                 />
               </form>
            </div>

            {/* Avatar / Login */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 group focus:outline-none">
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/20 group-hover:border-white/50 transition bg-gray-800">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_metadata?.username || user.email}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <svg className={`w-3 h-3 text-white transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>

                {/* Dropdown Menu */}
                <div className={`absolute right-0 mt-3 w-56 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 transition-all duration-200 origin-top-right transform ${showDropdown ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}>
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-white font-bold text-sm truncate">{user.user_metadata?.username || "Membro"}</p>
                    <p className="text-gray-500 text-xs truncate">{user.email}</p>
                  </div>
                  
                  <DropdownLink href="/account">Minha Conta</DropdownLink>
                  <DropdownLink href="/suggestions">Meus Pedidos</DropdownLink>
                  {/* Se quiseres link de admin, podes por aqui uma verificação */}
                  
                  <div className="border-t border-white/5 mt-2 pt-2">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors">
                      Sair
                    </button>
                  </div>
                </div>
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

// Pequenos componentes auxiliares para limpar o código
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