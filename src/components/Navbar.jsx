"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaSearch, FaUser, FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Efeito de fundo preto ao fazer scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fecha o menu mobile ao mudar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Início", href: "/" },
    { name: "Filmes", href: "/movies" },
    { name: "Séries", href: "/series" },
    { name: "Minha Lista", href: "/account" },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        isScrolled || mobileMenuOpen
          ? "bg-black/90 backdrop-blur-md border-white/5 py-3"
          : "bg-gradient-to-b from-black/80 to-transparent border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo e Links Desktop */}
        <div className="flex items-center gap-8">
          <Link href="/" className="active:scale-95 transition-transform">
            <Logo />
          </Link>
          
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    pathname === link.href ? "text-white" : "text-zinc-400 hover:text-purple-500"
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Lado Direito: Ícones */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* Lupa de Pesquisa (Agora funciona no mobile com clique direto) */}
          <Link 
            href="/search" 
            className="text-white hover:text-purple-500 transition-all p-2 rounded-full active:scale-90 active:bg-white/10"
          >
            <FaSearch size={18} />
          </Link>

          {/* Notificações (Só se tiver logado) */}
          {user && <NotificationBell />}

          {/* Perfil (Desktop) */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/account">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-transparent hover:ring-purple-400 transition-all active:scale-90">
                  {profile?.username?.[0]?.toUpperCase() || "U"}
                </div>
              </Link>
            </div>
          ) : (
            <Link
              href="/auth"
              className="hidden md:block bg-white text-black px-5 py-2 rounded-full text-xs font-black hover:bg-zinc-200 transition active:scale-95"
            >
              ENTRAR
            </Link>
          )}

          {/* Botão Menu Mobile (Hambúrguer) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 active:scale-90 transition-transform"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* --- MENU MOBILE (Desliza de cima) --- */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-black border-b border-white/10 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-8 flex flex-col gap-6">
          
          {/* Links de Navegação Mobile */}
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xl font-bold ${
                  pathname === link.href ? "text-purple-500 pl-4 border-l-4 border-purple-500" : "text-zinc-400"
                } active:text-white transition-all`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="h-px bg-white/10 w-full my-2" />

          {/* Área de Utilizador Mobile */}
          {user ? (
            <div className="space-y-4">
              <Link href="/account" className="flex items-center gap-3 text-zinc-300 active:text-white group">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white group-active:scale-95 transition">
                   {profile?.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white">{profile?.username}</span>
                  <span className="text-[10px] text-zinc-500">Ver Perfil</span>
                </div>
              </Link>
              
              <button 
                onClick={signOut}
                className="flex items-center gap-2 text-red-500 text-sm font-bold mt-4 active:scale-95 transition-transform"
              >
                <FaSignOutAlt /> Terminar Sessão
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="block w-full bg-purple-600 text-white text-center py-4 rounded-xl font-black active:scale-95 transition-transform"
            >
              INICIAR SESSÃO
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}