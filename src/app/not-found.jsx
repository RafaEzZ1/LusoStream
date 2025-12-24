// src/app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center text-center px-6">
      {/* O fundo e o layout já vêm do RootLayout global */}
      <h1 className="text-9xl font-bold text-red-600 opacity-20 select-none animate-pulse">
        404
      </h1>
      
      <div className="mt-[-4rem] z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Houston, temos um problema.
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          A página que procuras perdeu-se no espaço ou foi abduzida.
        </p>
        
        <Link 
          href="/"
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 hover:bg-gray-200 transition shadow-lg inline-block"
        >
          🏠 Voltar ao Início
        </Link>
      </div>
    </div>
  );
}