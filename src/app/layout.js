import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; // Importa o Footer
import { AuthProvider } from "@/components/AuthProvider";
import { AuthModalProvider } from "@/context/AuthModalContext";
import AuthModal from "@/components/AuthModal";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <AuthProvider>
          <AuthModalProvider>
            <Navbar />
            {/* Adicionamos pt-20 para o conteúdo não ficar por baixo da Navbar */}
            <div className="pt-20 min-h-screen">
              {children}
            </div>
            <Footer /> {/* Footer adicionado aqui para aparecer em todas as páginas */}
            <AuthModal />
            <Toaster position="bottom-center" /> 
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}