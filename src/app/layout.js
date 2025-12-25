import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/AuthModal";
import { Toaster } from 'react-hot-toast'; // <--- IMPORT NOVO

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LusoStream - O Teu Cinema em Casa",
  description: "Vê filmes e séries online com a melhor qualidade.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
            {children}
            <AuthModal />
            <Toaster position="bottom-center" toastOptions={{ // <--- CONFIGURAÇÃO NOVA
              style: {
                background: '#333',
                color: '#fff',
              },
            }} /> 
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}