"use client";
import Link from "next/link";
import { FaFilm, FaTv, FaBookmark, FaHome, FaShieldAlt } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 pt-16 pb-10 px-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          
          {/* Coluna 1: Sobre */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-purple-600 tracking-tighter italic italic">LUSOSTREAM</h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              A tua plataforma definitiva de entretenimento. Explora milhares de filmes e séries com a melhor qualidade, tudo num só lugar e pensado para ti.
            </p>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Explorar</h3>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><Link href="/" className="hover:text-white transition flex items-center gap-2"><FaHome size={10}/> Início</Link></li>
                <li><Link href="/movies" className="hover:text-white transition flex items-center gap-2"><FaFilm size={10}/> Filmes</Link></li>
                <li><Link href="/series" className="hover:text-white transition flex items-center gap-2"><FaTv size={10}/> Séries</Link></li>
                <li><Link href="/account" className="hover:text-white transition flex items-center gap-2"><FaBookmark size={10}/> Minha Lista</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Legal</h3>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li><Link href="/terms" className="hover:text-white transition">Termos e Condições</Link></li>
                <li><Link href="/dmca" className="hover:text-white transition">Aviso DMCA</Link></li>
                <li><Link href="/suggestions" className="hover:text-white transition">Sugestões</Link></li>
              </ul>
            </div>
          </div>

          {/* Coluna 3: Status */}
          <div className="bg-zinc-900/30 p-6 rounded-3xl border border-white/5 flex flex-col justify-center">
             <div className="flex items-center gap-2 mb-2 text-green-500">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold uppercase">Servidores Online</span>
             </div>
             <p className="text-zinc-500 text-xs">A desfrutar da melhor experiência de streaming em 2025.</p>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            © 2025 LusoStream • Premium Streaming Experience
          </p>
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-black italic border border-zinc-800 px-3 py-1 rounded-full">
            <FaShieldAlt /> DMCA PROTECTED
          </div>
        </div>
      </div>
    </footer>
  );
}