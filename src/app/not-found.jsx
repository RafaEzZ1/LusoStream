// src/app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center text-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black -z-10" />
      
      <h1 className="text-9xl font-bold text-red-600 opacity-20 animate-pulse">404</h1>
      
      <div className="relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Página não encontrada.</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md">
          A página que procuras não existe ou foi movida.
        </p>
        
        <Link 
          href="/"
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition shadow-lg flex items-center gap-2"
        >
          🏠 Voltar ao Início
        </Link>
      </div>
    </div>
  );
}