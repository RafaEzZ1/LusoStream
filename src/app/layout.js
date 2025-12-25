import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/AuthModal";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LusoStream",
  description: "O melhor do cinema em português.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white`}>
        {/* 1. O AuthProvider dá acesso ao Utilizador (Firebase) */}
        <AuthProvider>
          {/* 2. O AuthModalProvider dá acesso ao Pop-up de Login */}
          <AuthModalProvider>
            
            <Navbar />
            
            {/* O Modal fica aqui "escondido" à espera de ser chamado */}
            <AuthModal /> 
            
            {children}
            
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}