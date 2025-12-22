// src/components/Footer.jsx
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-900 text-gray-400 py-12 mt-12 z-10 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Coluna 1: Logo e Slogan */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-red-600 tracking-tighter hover:text-red-500 transition">
              LusoStream
            </Link>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              A tua plataforma de streaming favorita. Filmes, séries e animes com a melhor qualidade, onde e quando quiseres.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Navegação</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition">Início</Link></li>
              <li><Link href="/movies" className="hover:text-white transition">Filmes</Link></li>
              <li><Link href="/series" className="hover:text-white transition">Séries</Link></li>
              <li><Link href="/animes" className="hover:text-white transition">Animes</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Comunidade */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Comunidade</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/suggestions" className="hover:text-white transition">Pedir Filmes</Link></li>
              <li><Link href="/auth" className="hover:text-white transition">Criar Conta</Link></li>
              <li><span className="text-gray-600 cursor-not-allowed">Discord (Brevemente)</span></li>
            </ul>
          </div>

          {/* Coluna 4: Legal (ATUALIZADO) */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm">
              {/* Todos apontam para a mesma página, mas com secções diferentes */}
              <li><Link href="/terms" className="hover:text-white transition">Termos de Uso</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Privacidade</Link></li>
              <li>
                <Link href="/terms#dmca" className="hover:text-red-400 transition text-red-600 font-bold">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <p>&copy; {year} LusoStream. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <span>Feito com ❤️ em Portugal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}