"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaSearch, FaBars, FaTimes, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para a Pesquisa Animada
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Foca no input automaticamente quando abres a pesquisa
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Filmes", href: "/movies" },
    { name: "Séries", href: "/series" },
    { name: "Minha Lista", href: "/account" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled || mobileMenuOpen || searchOpen
          ? "bg-black/95 backdrop-blur-xl border-white/5 py-3 shadow-2xl"
          : "bg-gradient-to-b from-black/80 to-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between relative">
        
        {/* --- LADO ESQUERDO: LOGO E LINKS --- */}
        {/* Se a pesquisa estiver aberta no mobile, escondemos o logo para dar espaço */}
        <div className={`flex items-center gap-8 transition-opacity duration-200 ${searchOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
          <Link href="/" className="active:scale-90 transition-transform duration-200 z-50">
            <Logo />
          </Link>
          
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-bold tracking-wide transition-all hover:text-purple-500 ${
                    pathname === link.href ? "text-white scale-105" : "text-zinc-400"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* --- CENTRO/DIREITA: BARRA DE PESQUISA EXPANDÍVEL --- */}
        <div className={`flex items-center ${searchOpen ? 'absolute left-0 w-full px-4 h-full top-0 z-50 justify-center bg-black md:bg-transparent md:relative md:w-auto md:px-0' : 'relative'}`}>
            
            <form 
              onSubmit={handleSearchSubmit}
              className={`flex items-center transition-all duration-300 ease-in-out bg-zinc-900/90 rounded-full px-4 py-2 border border-white/10 ${
                searchOpen ? 'w-full md:w-80 opacity-100 scale-100' : 'w-0 opacity-0 scale-95 overflow-hidden border-0 p-0'
              }`}
            >
              <FaSearch className="text-zinc-500 mr-3 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filmes ou Séries..."
                className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder:text-zinc-600"
                autoComplete="off"
              />
              <button 
                type="button" 
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="text-zinc-500 hover:text-white ml-2 p-1 active:scale-90"
              >
                <FaTimes />
              </button>
            </form>

            {/* Ícone da Lupa (Só aparece quando a barra está fechada) */}
            <button 
              onClick={() => setSearchOpen(true)}
              className={`text-zinc-300 hover:text-white p-3 rounded-full active:scale-75 transition-all duration-200 ${searchOpen ? 'hidden' : 'block'}`}
            >
              <FaSearch size={20} />
            </button>
        </div>

        {/* --- LADO DIREITO: ÍCONES --- */}
        {/* Escondemos no mobile se a pesquisa estiver aberta */}
        <div className={`flex items-center gap-2 md:gap-6 ${searchOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {user && <NotificationBell />}

          {user ? (
            <div className="hidden md:block">
              <Link href="/account" className="block active:scale-90 transition-transform">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold ring-2 ring-black">
                  {profile?.username?.[0]?.toUpperCase() || <FaUserCircle />}
                </div>
              </Link>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden md:block bg-white text-black px-6 py-2 rounded-full text-xs font-black hover:bg-zinc-200 transition active:scale-90 shadow-lg shadow-white/10"
            >
              ENTRAR
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-zinc-300 p-3 active:scale-75 transition-transform duration-200 active:text-white"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE (HAMBÚRGUER) --- */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-bold py-3 active:scale-95 origin-left transition-transform ${
                  pathname === link.href ? "text-purple-500" : "text-zinc-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-px bg-white/5 w-full my-2" />

          {user ? (
            <div className="space-y-4">
              <Link href="/account" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl active:scale-95 transition-transform">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                   {profile?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">{profile?.username}</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">Minha Conta</span>
                </div>
              </Link>
              <button 
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-500/10 py-4 rounded-xl text-sm font-bold active:scale-95 transition-all"
              >
                <FaSignOutAlt /> Terminar Sessão
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="block w-full bg-white text-black text-center py-4 rounded-xl font-black active:scale-95 transition-transform shadow-xl"
            >
              INICIAR SESSÃO
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}