import Link from "next/link";
import { FaHome } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
      <div className="absolute top-0 w-full h-96 bg-purple-600/10 blur-[120px] pointer-events-none" />
      
      <h1 className="text-[150px] font-black text-white/5 leading-none tracking-tighter select-none">404</h1>
      
      <div className="relative -mt-20 z-10">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
          Perdeste-te no <span className="text-purple-600">Catálogo?</span>
        </h2>
        <p className="text-zinc-500 max-w-sm mx-auto mb-10 text-sm font-medium leading-relaxed">
          A página que procuras não existe ou foi movida para outra dimensão. Volta ao início para continuar a ver.
        </p>
        
        <Link 
          href="/" 
          className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-500 text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-2xl shadow-purple-900/40 uppercase text-xs tracking-widest"
        >
          <FaHome /> Voltar ao Início
        </Link>
      </div>
    </div>
  );
}