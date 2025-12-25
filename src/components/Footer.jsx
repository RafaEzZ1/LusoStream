import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Logo />
          <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
            O LusoStream não aloja nenhum conteúdo. Todos os links provêm de fontes externas.
          </p>
        </div>
        
        <div className="flex gap-8 text-sm text-gray-400">
          <Link href="/dmca" className="hover:text-white transition">DMCA</Link>
          <Link href="/terms" className="hover:text-white transition">Termos</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacidade</Link>
        </div>

        <div className="text-gray-600 text-xs">
          © {new Date().getFullYear()} LusoStream
        </div>
      </div>
    </footer>
  );
}