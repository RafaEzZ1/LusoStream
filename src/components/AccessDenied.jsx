// src/components/AccessDenied.jsx
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="text-8xl mb-6 animate-bounce">🧙‍♂️</div>
      
      <h1 className="text-5xl font-bold text-red-600 mb-2 tracking-tighter">
        YOU SHALL NOT PASS!
      </h1>
      
      <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
        Alto lá, viajante! Esta área é restrita aos Feiticeiros Supremos (Admins). 
        Parece que não tens a varinha mágica certa.
      </p>
      
      <Link 
        href="/" 
        className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 hover:bg-gray-200 transition shadow-lg shadow-white/20"
      >
        🏃 Fugir para o Início
      </Link>
    </div>
  );
}