"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider"; 
import { useAuthModal } from "@/context/AuthModalContext";
import { useRouter } from "next/navigation"; // Importante para a pesquisa
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, isAdmin } = useAuth(); // Profile não é estritamente necessário aqui se usarmos user.photoURL
  const { openModal } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Estado para a pesquisa
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  // Efeito de scroll para escurecer a navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Função de Pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue)}`);
      setMenuOpen(false); // Fecha menu mobile se estiver aberto
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-black/90 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/80 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Lado Esquerdo: Logo e Links Principais */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex-shrink-0"><Logo /></Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-white hover:text-gray-300 transition">Início</Link>
              <Link href="/movies" className="text-gray-300 hover:text-white transition">Filmes</Link>
              <Link href="/series" className="text-gray-300 hover:text-white transition">Séries</Link>
              <Link href="/suggestions" className="text-gray-300 hover:text-white transition">Pedir</Link>
            </div>
          </div>

          {/* Lado Direito: Pesquisa, Admin, Avatar */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* BARRA DE PESQUISA (Desktop) */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white/10 rounded-full px-3 py-1 border border-white/5 focus-within:border-white/30 transition">
               <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               <input 
                 type="text" 
                 placeholder="Pesquisar..." 
                 className="bg-transparent border-none outline-none text-sm text-white w-24 focus:w-48 transition-all placeholder-gray-400"
                 value={searchValue}
                 onChange={(e) => setSearchValue(e.target.value)}
               />
            </form>

            {/* Lupa para Mobile (Link direto para search vazio) */}
            <Link href="/search?q=" className="md:hidden text-gray-300">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </Link>

            {/* Sininho de Notificações */}
            <NotificationBell />

            {/* Estado de Autenticação */}
            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link href="/admin" className="hidden md:block bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition">
                    Admin
                  </Link>
                )}
                
                <Link href="/account" className="relative group">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 group-hover:border-white transition">
                    <img 
                      src={user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"} 
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              </div>
            ) : (
              <button 
                onClick={openModal}
                className="bg-white text-black px-4 py-1.5 rounded font-bold text-sm hover:bg-gray-200 transition"
              >
                Entrar
              </button>
            )}

            {/* Menu Mobile (Hambúrguer) */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-[#121212] border-t border-white/10 p-4 absolute w-full left-0 animate-in slide-in-from-top-5 shadow-2xl">
          <div className="flex flex-col gap-4 text-white font-medium text-lg">
            {/* Barra de pesquisa mobile */}
            <form onSubmit={handleSearch} className="flex items-center bg-white/5 rounded-lg px-3 py-2 mb-2">
               <input 
                 type="text" 
                 placeholder="Pesquisar filme ou série..." 
                 className="bg-transparent border-none outline-none text-white w-full"
                 value={searchValue}
                 onChange={(e) => setSearchValue(e.target.value)}
               />
               <button type="submit">🔍</button>
            </form>

            <Link href="/" onClick={() => setMenuOpen(false)}>Início</Link>
            <Link href="/movies" onClick={() => setMenuOpen(false)}>Filmes</Link>
            <Link href="/series" onClick={() => setMenuOpen(false)}>Séries</Link>
            <Link href="/suggestions" onClick={() => setMenuOpen(false)}>Pedir Filmes</Link>
            {isAdmin && <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-red-500">Painel Admin</Link>}
            {user && <Link href="/account" onClick={() => setMenuOpen(false)} className="text-blue-400">Minha Conta</Link>}
          </div>
        </div>
      )}
    </nav>
  );
}