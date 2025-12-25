import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 py-12 mt-20 border-t border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-purple-600 mb-4">LusoStream</h2>
            <p className="text-sm text-zinc-500">
              A melhor plataforma portuguesa de streaming. Filmes, séries e muito mais, tudo num só lugar.
            </p>
          </div>

          {/* Navegação */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-purple-500 transition">Início</Link></li>
              <li><Link href="/filmes" className="hover:text-purple-500 transition">Filmes</Link></li>
              <li><Link href="/series" className="hover:text-purple-500 transition">Séries</Link></li>
              <li><Link href="/minha-lista" className="hover:text-purple-500 transition">Minha Lista</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-purple-500 transition">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-purple-500 transition">Privacidade</a></li>
              <li><a href="#" className="hover:text-purple-500 transition">Cookies</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Segue-nos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-xl hover:text-purple-500 transition"><FaInstagram /></a>
              <a href="#" className="text-xl hover:text-purple-500 transition"><FaTwitter /></a>
              <a href="#" className="text-xl hover:text-purple-500 transition"><FaFacebook /></a>
              <a href="#" className="text-xl hover:text-purple-500 transition"><FaGithub /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 text-center text-xs text-zinc-600">
          <p>&copy; {new Date().getFullYear()} LusoStream. Todos os direitos reservados. Desenvolvido com ❤️.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;