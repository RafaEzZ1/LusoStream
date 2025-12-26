import Link from 'next/link';
import { FaShieldAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#050505] text-zinc-400 py-16 border-t border-zinc-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-black text-purple-600 mb-4 italic tracking-tighter">LUSOSTREAM</h2>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              Explora o melhor do cinema e das séries em alta definição. O LusoStream oferece uma experiência de streaming fluida, moderna e pensada para os verdadeiros fãs de entretenimento.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Navegação</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-purple-500 transition">Página Inicial</Link></li>
              <li><Link href="/movies" className="hover:text-purple-500 transition">Filmes</Link></li>
              <li><Link href="/series" className="hover:text-purple-500 transition">Séries</Link></li>
              <li><Link href="/account" className="hover:text-purple-500 transition">A Minha Lista</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Suporte & Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/terms" className="hover:text-purple-500 transition">Termos de Uso</Link></li>
              <li><Link href="/dmca" className="hover:text-purple-500 transition flex items-center gap-2"><FaShieldAlt size={12}/> DMCA Policy</Link></li>
              <li><Link href="/suggestions" className="hover:text-purple-500 transition">Sugerir Melhoria</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-8 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700">
          <p>© {new Date().getFullYear()} LusoStream. Conteúdo Protegido.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;