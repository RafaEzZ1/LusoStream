// src/context/AuthModalContext.js
"use client";

import { createContext, useContext, useState } from "react";
import AuthModal from "@/components/AuthModal"; // Vamos criar este a seguir

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      {/* O Modal fica aqui, invisível até alguém chamar o openModal */}
      {isOpen && <AuthModal onClose={closeModal} />}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);