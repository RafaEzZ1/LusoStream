"use client";
import Link from "next/link";
import { FaShieldAlt, FaInfoCircle } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 pt-16 pb-10 px-6 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          
          {/* Coluna 1: LusoStream */}
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-purple-600 tracking-tighter italic">LUSOSTREAM</h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              A tua plataforma de eleição para explorar o melhor do cinema. Qualidade, rapidez e uma interface pensada para ti.
            </p>
          </div>

          {/* Coluna 2: Atalhos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest">Explorar</h3>
              <ul className="space-y-3 text-zinc-500 text-sm font-medium">
                <li><Link href="/" className="hover:text-purple-500 transition">Início</Link></li>
                <li><Link href="/movies" className="hover:text-purple-500 transition">Filmes</Link></li>
                <li><Link href="/series" className="hover:text-purple-500 transition">Séries</Link></li>
                <li><Link href="/account" className="hover:text-purple-500 transition">Minha Lista</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-white font-bold text-xs uppercase tracking-widest">Suporte</h3>
              <ul className="space-y-3 text-zinc-500 text-sm font-medium">
                <li><Link href="/suggestions" className="hover:text-purple-500 transition">Sugestões / Bugs</Link></li>
                <li><Link href="/terms" className="hover:text-purple-500 transition">Termos de Uso</Link></li>
                {/* O link abaixo vai para a secção específica dentro dos termos */}
                <li><Link href="/terms#dmca" className="hover:text-purple-500 transition">Aviso Legal</Link></li>
              </ul>
            </div>
          </div>

          {/* Coluna 3: Info */}
          <div className="bg-zinc-900/30 p-6 rounded-3xl border border-white/5">
             <div className="flex items-center gap-2 mb-2 text-purple-500">
               <FaInfoCircle size={14} />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Informação</span>
             </div>
             <p className="text-zinc-500 text-[11px] leading-relaxed italic">
               O LusoStream indexa conteúdos externos e não aloja ficheiros próprios. Respeitamos todos os direitos de autor.
             </p>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            © 2025 LusoStream • Premium Experience
          </p>
          <div className="flex items-center gap-2 text-zinc-700 text-[10px] font-black italic border border-zinc-800 px-3 py-1 rounded-full">
            <FaShieldAlt /> CONTEÚDO PROTEGIDO
          </div>
        </div>
      </div>
    </footer>
  );
}