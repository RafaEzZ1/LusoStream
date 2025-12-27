"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaSearch, FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
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
    { name: "Sugestões", href: "/suggestions" }, // VOLTOU!
    { name: "Minha Lista", href: "/account" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled || mobileMenuOpen
          ? "bg-black/95 backdrop-blur-xl border-white/5 py-3 shadow-2xl"
          : "bg-gradient-to-b from-black/80 to-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between relative">
        
        {/* LOGO */}
        <div className={`flex items-center gap-8 transition-opacity duration-300 ${searchOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'}`}>
          <Link href="/" className="active:scale-90 transition-transform duration-200">
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

        {/* LADO DIREITO */}
        <div className="flex items-center justify-end gap-2 md:gap-4 relative">
          
          {/* PESQUISA */}
          <div className={`${
            searchOpen 
              ? 'absolute inset-0 -mx-4 px-4 bg-black md:bg-transparent md:static md:mx-0 md:px-0 flex items-center justify-center z-50 h-full' 
              : 'relative'
          }`}>
            <form 
              onSubmit={handleSearchSubmit}
              className={`flex items-center bg-zinc-900 border border-white/10 rounded-full overflow-hidden transition-all duration-300 ease-out shadow-xl ${
                searchOpen ? 'w-full md:w-64 opacity-100 pl-4 pr-1 py-1' : 'w-0 opacity-0 border-0 p-0 hidden'
              }`}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full bg-transparent text-white text-sm font-medium outline-none placeholder:text-zinc-500 min-w-0"
                autoComplete="off"
              />
              <button 
                type="button" 
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="text-zinc-400 hover:text-white p-2 rounded-full flex-shrink-0"
              >
                <FaTimes size={14} />
              </button>
              <button 
                type="submit"
                className="text-purple-500 hover:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 p-2 rounded-full ml-1 transition-colors flex-shrink-0"
              >
                <FaSearch size={14} />
              </button>
            </form>

            <button 
              onClick={() => setSearchOpen(true)}
              className={`text-zinc-300 hover:text-white p-2.5 rounded-full active:scale-75 transition-all duration-200 ${searchOpen ? 'hidden' : 'block'}`}
            >
              <FaSearch size={18} />
            </button>
          </div>

          {/* ÍCONES */}
          <div className={`flex items-center gap-2 md:gap-4 transition-opacity duration-200 ${searchOpen ? 'hidden md:flex' : 'flex'}`}>
            
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-red-500 hover:text-red-400 p-2 rounded-full bg-red-500/10 border border-red-500/20 active:scale-90 transition-all flex items-center justify-center">
                <FaShieldAlt size={16} />
              </Link>
            )}

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
              <Link href="/auth" className="hidden md:block bg-white text-black px-5 py-2 rounded-full text-xs font-black hover:bg-zinc-200 transition active:scale-90">
                ENTRAR
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-zinc-300 p-2 active:scale-75 transition-transform duration-200 active:text-white"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 ${mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-6 py-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-2xl font-bold py-3 active:scale-95 origin-left transition-transform ${pathname === link.href ? "text-purple-500" : "text-zinc-400"}`}
              >
                {link.name}
              </Link>
            ))}
            {profile?.role === 'admin' && (
              <Link href="/admin" className="text-2xl font-bold py-3 text-red-500 active:scale-95 origin-left transition-transform flex items-center gap-2">
                <FaShieldAlt /> Painel Admin
              </Link>
            )}
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
              <button onClick={signOut} className="w-full flex items-center justify-center gap-2 text-red-500 bg-red-500/10 py-4 rounded-xl text-sm font-bold active:scale-95 transition-all">
                <FaSignOutAlt /> Terminar Sessão
              </button>
            </div>
          ) : (
            <Link href="/auth" className="block w-full bg-white text-black text-center py-4 rounded-xl font-black active:scale-95 transition-transform shadow-xl">
              INICIAR SESSÃO
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}