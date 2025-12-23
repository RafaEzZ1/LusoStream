// src/components/AuthModal.jsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AuthModal({ onClose }) {
  
  // Fechar com a tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Caixa do Modal */}
      <div className="bg-gray-900 border border-gray-700 w-full max-w-md rounded-2xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Botão Fechar (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Conta Necessária</h2>
          <p className="text-gray-400 mb-6">
            Para fazer pedidos, sugestões ou reportar erros, precisas de ter uma conta no LusoStream. É grátis e demora 10 segundos!
          </p>

          <div className="flex flex-col gap-3">
            <Link 
              href="/auth" 
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition w-full"
            >
              Entrar / Criar Conta
            </Link>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 text-sm font-medium py-2 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}