// src/components/Footer.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";

export default function Footer() {
  const pathname = usePathname();

  // Não mostrar footer no Admin ou Auth
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/auth"))) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 pt-16 pb-8 text-gray-400 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Coluna 1: Logo e Sobre */}
        <div className="space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-gray-500">
            A tua plataforma de streaming favorita. Sem anúncios intrusivos, apenas cinema puro.
          </p>
        </div>

        {/* Coluna 2: Navegação */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Navegação</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/movies" className="hover:text-red-500 transition">Filmes</Link></li>
            <li><Link href="/series" className="hover:text-red-500 transition">Séries</Link></li>
            {/* CORREÇÃO AQUI: Mudámos de '/animes' para '/series' para evitar o erro 404 */}
            <li><Link href="/series" className="hover:text-red-500 transition">Animes</Link></li>
            <li><Link href="/suggestions" className="hover:text-red-500 transition">Pedir Conteúdo</Link></li>
          </ul>
        </div>

        {/* Coluna 3: Legal */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-red-500 transition">Termos de Uso</Link></li>
            <li><span className="cursor-not-allowed opacity-50">Privacidade</span></li>
            <li><span className="cursor-not-allowed opacity-50">DMCA</span></li>
          </ul>
        </div>

        {/* Coluna 4: Conta */}
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Conta</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/auth" className="hover:text-red-500 transition">Entrar / Registar</Link></li>
            <li><Link href="/account" className="hover:text-red-500 transition">Minha Lista</Link></li>
            <li><Link href="/account" className="hover:text-red-500 transition">Definições</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
        <p>© {currentYear} LusoStream. Todos os direitos reservados.</p>
        <p>Feito com ❤️ para a comunidade.</p>
      </div>
    </footer>
  );
}