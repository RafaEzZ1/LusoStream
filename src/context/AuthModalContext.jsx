// src/context/AuthModalContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fecha o modal automaticamente se o utilizador mudar de página (ex: for para o login)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* O DESIGN DO POP-UP FICA AQUI (Global) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Fundo Escuro com Blur */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* A Janela do Modal */}
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
            
            {/* Ícone ou Emoji */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-white mb-2">
              Conta necessária
            </h3>
            
            <p className="text-gray-400 text-center text-sm mb-6">
              Precisas de ter conta no LusoStream para usar esta funcionalidade. É grátis e rápido!
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-center transition shadow-lg shadow-red-900/20"
              >
                Entrar / Criar Conta
              </Link>
              
              <button
                onClick={closeModal}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-medium py-3 rounded-xl transition"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
}

// Hook para usar nos botões
export function useAuthModal() {
  return useContext(AuthModalContext);
}